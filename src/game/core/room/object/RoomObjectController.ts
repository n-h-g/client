import {Point3d} from '../../../utils/point/Point3d';
import {Disposable} from '../Disposable';
import {Positionable} from './Positionable';

export abstract class RoomObjectController<
        IRoomObjectVisualization extends Disposable,
        IRoomObjectLogic extends Disposable,
    >
    implements Positionable, Disposable
{
    position: Point3d;
    visualization: IRoomObjectVisualization;
    logic: IRoomObjectLogic;

    constructor(public readonly id: string) {}

    dispose(): void {
        this.visualization.dispose();
        this.logic.dispose();
    }
}
