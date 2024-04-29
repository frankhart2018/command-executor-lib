import { existsSync, writeFileSync, statSync, readFileSync } from "fs";
import { CommandOutput, CommandOutputType } from "./command-output";
import { ExecuteStrategy } from "./execute-strategy";
import { CommandSerializer, JsonSerializer } from "./command-serializer";

const GENERIC_OUTPUT_PATH = "output.txt";
const PIPE_OUTPUT_CACHE_MINUTES = 3;
const PIPE_WAIT_SLEEP_TIME = 100; // 100ms
const DEFAULT_EXECUTION_TIMEOUT = 10000; // 10_000ms = 10s

class PipeExecuteStrategy implements ExecuteStrategy {
  protected useCache: boolean;
  protected pipePath: string;
  protected outputPath: string;
  protected commandSerializer: CommandSerializer;
  protected executionTimeout: number;

  constructor() {
    this.useCache = false;
    this.outputPath = GENERIC_OUTPUT_PATH;
    this.commandSerializer = new JsonSerializer(this.outputPath);
    this.executionTimeout = DEFAULT_EXECUTION_TIMEOUT;
  }

  setUseCache = (useCache: boolean) => {
    this.useCache = useCache;
  };

  setPipePath = (pipePath: string) => {
    this.pipePath = pipePath;
  };

  setOutputPath = (outputPath: string) => {
    this.outputPath = outputPath;
    this.commandSerializer = new JsonSerializer(outputPath);
  };

  setExecutionTimeout = (executionTimeout: number) => {
    this.executionTimeout = executionTimeout;
  };

  setCommandSerializer = (commandSerializer: CommandSerializer) => {
    this.commandSerializer = commandSerializer;
  }

  getPipePath = (): string => {
    return this.pipePath;
  }

  private getFileLastModified = (filePath: string): number => {
    if (!existsSync(filePath)) {
      return -1;
    }
    let stats = statSync(filePath);
    return stats.mtimeMs;
  };

  private getCachedOutput = (filePath: string): CommandOutput | null => {
    let cachedOutput: CommandOutput | null = null;
    if (existsSync(filePath)) {
      const lastModifiedCached = this.getFileLastModified(filePath);
      const now = Date.now();
      const diff = (now - lastModifiedCached) / (1000 * 60);

      // If the last updated time was within threshold
      // Return the last result, no need to run the program again
      if (diff <= PIPE_OUTPUT_CACHE_MINUTES) {
        cachedOutput = new CommandOutput(
          CommandOutputType.Success,
          readFileSync(filePath).toString()
        );
      }
    }

    return cachedOutput;
  };

  private sleep = (ms: number) => {
    const start = Date.now();
    while (Date.now() - start < ms) {}
  };

  private waitForOutputWithTimeout = (lastModified: number) => {
    const start = Date.now();
    let didTimeout = false;

    const isTimedOut = () => {
      const now = Date.now();
      const diff = now - start;
      const result = diff > this.executionTimeout;
      if (result) {
        didTimeout = true;
      }
      return result;
    }

    // If output path does not exist, wait for it to be created
    // Edge case, will happen only first time
    if (!existsSync(this.outputPath)) {
      while (!existsSync(this.outputPath) && !isTimedOut()) {
        this.sleep(PIPE_WAIT_SLEEP_TIME);
      }
    } else {
      // Otherwise wait for the file to be modified
      while (true && !isTimedOut()) {
        const lastModifiedUpdated = this.getFileLastModified(this.outputPath);
        if (lastModified !== lastModifiedUpdated) {
          break;
        }
        this.sleep(PIPE_WAIT_SLEEP_TIME);
      }
    }
    
    return didTimeout;
  };

  execute = (cmd: string): CommandOutput => {
    const cachedOutput = this.useCache
      ? this.getCachedOutput(this.outputPath)
      : null;
    if (cachedOutput !== null) return cachedOutput;

    writeFileSync(this.pipePath, this.commandSerializer.serialize(cmd));

    const lastModified = this.getFileLastModified(this.outputPath);
    const didTimeout = this.waitForOutputWithTimeout(lastModified);
    if (didTimeout) {
      return new CommandOutput(CommandOutputType.TimedOut, `${cmd} timed out after ${this.executionTimeout}ms`);
    }

    const outputData = readFileSync(this.outputPath).toString();
    return new CommandOutput(CommandOutputType.Success, outputData);
  };

  static builder = () => {
    return new PipeExecuteStrategyBuilder();
  };
}

class PipeExecuteStrategyBuilder {
  container: PipeExecuteStrategy;

  constructor() {
    this.container = new PipeExecuteStrategy();
  }

  checkPath = (path: string, fileName: string): void => {
    if (!existsSync(path)) {
      throw new Error(`${fileName} does not exist!`);
    }
  };

  withPipePath = (pipePath: string): any => {
    this.checkPath(pipePath, "Pipe path");
    this.container.setPipePath(pipePath);
    return this;
  };

  withCache = (useCache: boolean): any => {
    this.container.setUseCache(useCache);
    return this;
  };

  withOutputPath = (outputPath: string): any => {
    this.container.setOutputPath(outputPath);
    this.container.setCommandSerializer(new JsonSerializer(outputPath));
    return this;
  };

  withExecutionTimeout = (executionTimeout: number): any => {
    this.container.setExecutionTimeout(executionTimeout);
    return this;
  };

  build = (): ExecuteStrategy => {
    if (this.container.getPipePath() === undefined) {
      throw new Error("Pipe path is required!");
    }

    return this.container;
  };
};

export { PipeExecuteStrategy };
