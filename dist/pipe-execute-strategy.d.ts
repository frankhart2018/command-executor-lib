import { CommandOutput } from "./command-output";
import { ExecuteStrategy } from "./execute-strategy";
import { CommandSerializer } from "./command-serializer";
declare class PipeExecuteStrategy implements ExecuteStrategy {
    protected useCache: boolean;
    protected pipePath: string;
    protected outputPath: string;
    protected commandSerializer: CommandSerializer;
    constructor();
    private getFileLastModified;
    private getCachedOutput;
    private sleep;
    execute: (cmd: string) => CommandOutput;
    static builder: () => {
        container: PipeExecuteStrategy;
        checkPath: (path: string, fileName: string) => void;
        withPipePath: (pipePath: string) => this;
        withCache: (useCache: boolean) => this;
        withOutputPath: (outputPath: string) => this;
        build: () => ExecuteStrategy;
    };
    static PipeExecuteStrategyBuilder: {
        new (): {
            container: PipeExecuteStrategy;
            checkPath: (path: string, fileName: string) => void;
            withPipePath: (pipePath: string) => this;
            withCache: (useCache: boolean) => this;
            withOutputPath: (outputPath: string) => this;
            build: () => ExecuteStrategy;
        };
    };
}
export { PipeExecuteStrategy };
