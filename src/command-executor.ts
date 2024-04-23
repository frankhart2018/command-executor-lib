import { ExecuteStrategy } from "./execute-strategy";

class CommandExecutor {
  cmd: string;
  strategy: ExecuteStrategy;

  constructor(cmd: string, strategy: ExecuteStrategy) {
    this.cmd = cmd;
    this.strategy = strategy;
  }

  execute = () => {
    return this.strategy.execute(this.cmd);
  };
}

export { CommandExecutor };
