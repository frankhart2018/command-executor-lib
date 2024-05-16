import { ExecuteStrategy } from "./execute-strategy";

class CommandExecutor {
  strategy: ExecuteStrategy;

  constructor(strategy: ExecuteStrategy) {
    this.strategy = strategy;
  }

  execute = (cmd: string) => {
    return this.strategy.execute(cmd);
  };
}

export { CommandExecutor };
