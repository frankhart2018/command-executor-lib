enum CommandOutputType {
  Success = 0,
  Error = 1,
}

class CommandOutput {
  type: CommandOutputType;
  value: string;

  constructor(type: CommandOutputType, value: string) {
    this.type = type;
    this.value = value;
  }
}

export { CommandOutput, CommandOutputType };
