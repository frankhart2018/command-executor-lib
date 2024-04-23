import { execSync } from "child_process";
import { CommandOutput, CommandOutputType } from "./command-output";
import { ExecuteStrategy } from "./execute-strategy";

class RegularExecuteStrategy implements ExecuteStrategy {
  execute = (cmd: string) => {
    try {
      const output = execSync(cmd.trim()).toString().trim();
      return new CommandOutput(CommandOutputType.Success, output);
    } catch (error) {
      return new CommandOutput(CommandOutputType.Error, error.message);
    }
  };
}

export { RegularExecuteStrategy };
