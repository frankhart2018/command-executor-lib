declare enum CommandOutputType {
    Success = 0,
    Error = 1
}
declare class CommandOutput {
    type: CommandOutputType;
    value: string;
    constructor(type: CommandOutputType, value: string);
}
export { CommandOutput, CommandOutputType };
