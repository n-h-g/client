import {Engine} from '../../../../Engine';
import {Point3d} from '../../../../utils/point/Point3d';
import {RoomObjectController} from '../RoomObjectController';
import {EntityLogic} from './EntityLogic';
import {EntityVisualization} from './EntityVisualization';

export abstract class Entity extends RoomObjectController<
    EntityVisualization,
    EntityLogic
> {
    protected _name: string;

    constructor(id: string, name: string) {
        super(id);

        const doorPosition =
            Engine.getInstance()?.roomService?.CurrentRoom?.roomLayout?.getDoorPosition();
        this.position = new Point3d(
            doorPosition.x,
            doorPosition.y,
            0
        );
        this._name = name;
    }

    dispose(): void {
        super.dispose();
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }
}
