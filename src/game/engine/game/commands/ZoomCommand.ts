import {Engine} from '../../../Engine';
import {RoomVisualization} from '../../room/visualization/RoomVisualization';
import {Command} from './Command';

export class ZoomCommand extends Command {
    constructor() {
        super('zoom');
    }

    handle(args: string[]): void {
        let scale = parseInt(args[0]);
        const currentRoom = Engine.getInstance().roomService!.CurrentRoom;
        const RoomVisualization = currentRoom!.roomLayout
            .visualization;

        scale = scale == 0 ? 1 : scale;
        RoomVisualization.zoom(scale);
    }
}
