import Point3d from "../../../utils/point/Point3d"
import { IRoomObjectLogic } from './IRoomObjectLogic'
import { IRoomObjectVisualization } from './IRoomObjectVisualization'

export abstract class RoomObjectController<IRoomObjectVisualization, IRoomObjectLogic> {
    public readonly _id: string
    protected _objectPosition: Point3d
    protected _objectVisualization: IRoomObjectVisualization
    protected _objectLogic: IRoomObjectLogic

    constructor(id: string, position: Point3d, visualization: IRoomObjectVisualization, logic: IRoomObjectLogic) {
        this._id = id;
        this._objectPosition = position
        this._objectVisualization = visualization
        this._objectLogic = logic
    }

    public get id(): string {
        return this._id
    }

    get position(): Point3d {
        return this._objectPosition
    }

    get visualization(): IRoomObjectVisualization {
        return this._objectVisualization
    }

    get logic(): IRoomObjectLogic {
        return this._objectLogic
    }

    set visualization(objectVisualization: IRoomObjectVisualization) {
        this._objectVisualization = objectVisualization;
    }

    set logic(objectLogic: IRoomObjectLogic) {
        this._objectLogic = objectLogic
    }

    set position(point: Point3d) {
        this._objectPosition = point
    }
}