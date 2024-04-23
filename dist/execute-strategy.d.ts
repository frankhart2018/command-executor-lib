import { CommandOutput } from "./command-output";
interface ExecuteStrategy {
    execute: (cmd: string) => CommandOutput;
}
export { ExecuteStrategy };
