import { RoomObjectLogic } from '../RoomObjectLogic';
import { Entity } from "./Entity";

export abstract class EntityLogic extends RoomObjectLogic {
    protected _entity: Entity
    
    protected frameTracker: number = 0

    public constructor(entity: Entity) {
        super()
        this._entity = entity
    }

    public abstract onPositionChanged(): void

    public abstract onLoad(): void

    public get entity(): Entity {
        return this._entity
    }
}