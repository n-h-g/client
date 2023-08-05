import { Service } from '../../../core/Service';
import { CommandRepository } from './CommandRepository'
import { Command } from './Command';
import { ChooserCommand } from './ChooserCommand';

export class CommandService extends Service<string, Command> {
    constructor() {
        super()

        this.repository = new CommandRepository()

        this.init()
    }

    public init() {
        this.addCommand(new ChooserCommand())
    }

    private addCommand(command: Command): void {
        this.repository?.add(command.definition, command)
    }
}