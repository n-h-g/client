export abstract class Command {
    readonly definition: string;
    readonly aliases: string[] = [];
    /** How to write it and what it does, for :commands (no description: not listed). */
    usage = '';
    description = '';

    constructor(definition: string, aliases: string[] = []) {
        this.definition = definition;
        this.aliases = aliases;
    }

    abstract handle(params: string[]): void;
}
