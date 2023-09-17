import {Repository} from '../../../core/Repository';
import {Command} from './Command';

export class CommandRepository extends Repository<string, Command> {
    getCommandByAlias(alias: string): Command {
        for (const command of this.getAll().values()) {
            if (command.aliases.indexOf(alias) > -1) return command;
        }

        return null;
    }
}
