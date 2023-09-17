import {ICommand} from '../../../core/game/commands/ICommand';

export abstract class Command implements ICommand {
    definition: string;
    aliases: string[] = [];

    constructor(definition: string, aliases: string[] = []) {
        this.definition = definition;
        this.aliases = aliases;
    }

    abstract handle(params: string[]): void;
}
