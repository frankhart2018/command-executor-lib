import { existsSync, writeFileSync, statSync, readFileSync } from "fs";
import { CommandOutput, CommandOutputType } from "./command-output";
import { ExecuteStrategy } from "./execute-strategy";
import { CommandSerializer, JsonSerializer } from "./command-serializer";

const GENERIC_OUTPUT_PATH = "output.txt";
const PIPE_OUTPUT_CACHE_MINUTES = 3;
const PIPE_WAIT_SLEEP_TIME = 100; // 100ms

class PipeExecuteStrategy implements ExecuteStrategy {
  protected useCache: boolean;
  protected pipePath: string;
  protected outputPath: string;
  protected commandSerializer: CommandSerializer;

  constructor() {
    this.useCache = false;
    this.outputPath = GENERIC_OUTPUT_PATH;
    this.commandSerializer = new JsonSerializer(this.outputPath);
  }

  private getFileLastModified = (filePath: string): number => {
    if (!existsSync(filePath)) {
      throw new Error("File does not exist!");
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

  execute = (cmd: string): CommandOutput => {
    const cachedOutput = this.useCache
      ? this.getCachedOutput(this.outputPath)
      : null;
    if (cachedOutput !== null) return cachedOutput;

    writeFileSync(this.pipePath, this.commandSerializer.serialize(cmd));

    const lastModified = this.getFileLastModified(this.outputPath);

    // If output path does not exist, wait for it to be created
    // Edge case, will happen only first time
    if (!existsSync(this.outputPath)) {
      while (!existsSync(this.outputPath)) {
        this.sleep(PIPE_WAIT_SLEEP_TIME);
      }
    } else {
      // Otherwise wait for the file to be modified
      while (true) {
        const lastModifiedUpdated = this.getFileLastModified(this.outputPath);
        if (lastModified !== lastModifiedUpdated) {
          break;
        }
        this.sleep(PIPE_WAIT_SLEEP_TIME);
      }
    }

    const outputData = readFileSync(this.outputPath).toString();
    return new CommandOutput(CommandOutputType.Success, outputData);
  };

  static builder = () => {
    return new PipeExecuteStrategy.PipeExecuteStrategyBuilder();
  };

  static PipeExecuteStrategyBuilder = class {
    container: PipeExecuteStrategy;

    constructor() {
      this.container = new PipeExecuteStrategy();
    }

    checkPath = (path: string, fileName: string): void => {
      if (!existsSync(path)) {
        throw new Error(`${fileName} does not exist!`);
      }
    };

    withPipePath = (pipePath: string): this => {
      this.checkPath(pipePath, "Pipe path");
      this.container.pipePath = pipePath;
      return this;
    };

    withCache = (useCache: boolean): this => {
      this.container.useCache = useCache;
      return this;
    };

    withOutputPath = (outputPath: string): this => {
      this.container.outputPath = outputPath;
      return this;
    };

    build = (): ExecuteStrategy => {
      if (this.container.pipePath === undefined) {
        throw new Error("Pipe path is required!");
      }

      return this.container;
    };
  };
}

export { PipeExecuteStrategy };
