import {Service} from '../../../core/Service';
import {CommandRepository} from './CommandRepository';
import {Command} from './Command';
import {ChooserCommand} from './ChooserCommand';
import {ZoomCommand} from './ZoomCommand';
import {Disposable} from '../../../core/room/Disposable';

export class CommandService extends Service<string, Command> implements Disposable {
    constructor() {
        super();
        this.repository = new CommandRepository();
        this.init();
    }

    init() {
        this.addCommand(new ChooserCommand());
        this.addCommand(new ZoomCommand());
    }

	dispose(): void {}

    private addCommand(command: Command): void {
        this.repository.add(command.definition, command);
    }
}
