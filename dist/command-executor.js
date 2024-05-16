"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecutor = void 0;
class CommandExecutor {
    constructor(strategy) {
        this.execute = (cmd) => {
            return this.strategy.execute(cmd);
        };
        this.strategy = strategy;
    }
}
exports.CommandExecutor = CommandExecutor;
