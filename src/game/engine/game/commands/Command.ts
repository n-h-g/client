export abstract class Command {
    readonly definition: string;
    readonly aliases: string[] = [];

    constructor(definition: string, aliases: string[] = []) {
        this.definition = definition;
        this.aliases = aliases;
    }

    abstract handle(params: string[]): void;
}
