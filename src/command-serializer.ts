interface CommandSerializer {
  serialize: (command: string) => string;
}

class JsonSerializer implements CommandSerializer {
  outputPath: string;

  constructor(outputPath: string) {
    this.outputPath = outputPath;
  }

  serialize = (command: string): string => {
    return JSON.stringify({
      cmd: command,
      outputPath: this.outputPath,
    });
  };
}

export { CommandSerializer, JsonSerializer };
