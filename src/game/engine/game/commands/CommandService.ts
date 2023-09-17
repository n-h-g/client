import {Service} from '../../../core/Service';
import {CommandRepository} from './CommandRepository';
import {Command} from './Command';
import {ChooserCommand} from './ChooserCommand';
import ZoomCommand from './ZoomCommand';

export class CommandService extends Service<string, Command> {
    constructor() {
        super();
        this.repository = new CommandRepository();
        this.init();
    }

    public init() {
        this.addCommand(new ChooserCommand());
        this.addCommand(new ZoomCommand());
    }

    private addCommand(command: Command): void {
        this.repository?.add(command.definition, command);
    }
}
