import { ExecuteStrategy } from "./execute-strategy";
declare class CommandExecutor {
    strategy: ExecuteStrategy;
    constructor(strategy: ExecuteStrategy);
    execute: (cmd: string) => import("./command-output").CommandOutput;
}
export { CommandExecutor };
//# sourceMappingURL=command-executor.d.ts.map