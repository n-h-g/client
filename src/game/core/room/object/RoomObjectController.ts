import { Point3d } from '../../../utils/point/Point3d'
import { IDisposable } from '../IDisposable'
import { Positionable } from './IPositionable'

export abstract class RoomObjectController<IRoomObjectVisualization extends IDisposable, IRoomObjectLogic extends IDisposable> implements Positionable,IDisposable {
    private readonly _id: string
    protected _objectPosition: Point3d
    protected _objectVisualization: IRoomObjectVisualization
    protected _objectLogic: IRoomObjectLogic

    constructor(id: string) {
        this._id = id;
    }

    public get id(): string {
        return this._id
    }

    public dispose(): void {
       this._objectVisualization.dispose()
       this._objectLogic.dispose()
    }

    public get position(): Point3d {
        return this._objectPosition
    }

    public get visualization(): IRoomObjectVisualization {
        return this._objectVisualization
    }

    public get logic(): IRoomObjectLogic {
        return this._objectLogic
    }

    public set visualization(objectVisualization: IRoomObjectVisualization) {
        this._objectVisualization = objectVisualization;
    }

    public set logic(objectLogic: IRoomObjectLogic) {
        this._objectLogic = objectLogic
    }

    public set position(point: Point3d) {
        this._objectPosition = point
    }
}