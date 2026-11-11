import {Engine} from '../../../Engine';

/** A line of the :commands window. */
export interface CommandHelp {
    usage: string;
    description: string;
}

/**
 * The commands of :commands: the ones of the server (it sends them, CommandsList) and the ones of the client
 * (CommandService), by name.
 */
export class CommandsList {
    private static serverCommands: CommandHelp[] = [];

    static setServerCommands(commands: CommandHelp[]): void {
        this.serverCommands = commands;
    }

    static all(): CommandHelp[] {
        const clientCommands: CommandHelp[] = [];
        const repository = Engine.getInstance()?.commandService?.repository;

        for (const command of repository?.getAll().values() ?? []) {
            if (command.description) clientCommands.push({usage: command.usage || `:${command.definition}`, description: command.description});
        }

        return [...this.serverCommands, ...clientCommands]
            .sort((a, b) => a.usage.localeCompare(b.usage));
    }
}
