import {Engine} from '../../../Engine';
import {Command} from './Command';

export class ChooserCommand extends Command {
    constructor() {
        super('chooser');
    }

    handle(args: string[]): void {
        const currentRoom = Engine.getInstance()?.roomService?.CurrentRoom;
    }
}
