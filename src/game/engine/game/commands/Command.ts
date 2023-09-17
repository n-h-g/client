import {ICommand} from '../../../core/game/commands/ICommand';

export abstract class Command implements ICommand {
    public definition: string;
    public aliases: string[] = [];

    constructor(definition: string, aliases: string[] = []) {
        this.definition = definition;
        this.aliases = aliases;
    }

    public abstract handle(params: string[]): void;
}
