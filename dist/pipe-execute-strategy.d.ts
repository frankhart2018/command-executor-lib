import { CommandOutput } from "./command-output";
import { ExecuteStrategy } from "./execute-strategy";
import { CommandSerializer } from "./command-serializer";
declare class PipeExecuteStrategy implements ExecuteStrategy {
    protected useCache: boolean;
    protected pipePath: string;
    protected outputPath: string;
    protected commandSerializer: CommandSerializer;
    protected executionTimeout: number;
    constructor();
    setUseCache: (useCache: boolean) => void;
    setPipePath: (pipePath: string) => void;
    setOutputPath: (outputPath: string) => void;
    setExecutionTimeout: (executionTimeout: number) => void;
    setCommandSerializer: (commandSerializer: CommandSerializer) => void;
    getPipePath: () => string;
    private getFileLastModified;
    private getCachedOutput;
    private sleep;
    private waitForOutputWithTimeout;
    execute: (cmd: string) => CommandOutput;
    static builder: () => PipeExecuteStrategyBuilder;
}
declare class PipeExecuteStrategyBuilder {
    container: PipeExecuteStrategy;
    constructor();
    checkPath: (path: string, fileName: string) => void;
    withPipePath: (pipePath: string) => any;
    withCache: (useCache: boolean) => any;
    withOutputPath: (outputPath: string) => any;
    withExecutionTimeout: (executionTimeout: number) => any;
    build: () => ExecuteStrategy;
}
export { PipeExecuteStrategy };
//# sourceMappingURL=pipe-execute-strategy.d.ts.map