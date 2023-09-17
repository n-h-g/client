import {Engine} from '../../../Engine';
import {Command} from './Command';

export class ChooserCommand extends Command {
    public constructor() {
        super('chooser');
    }

    public handle(args: string[]): void {
        const currentRoom = Engine.getInstance()?.roomService?.CurrentRoom;
    }
}
