import { RoomObjectLogic } from '../RoomObjectLogic';
import { Entity } from "./Entity";

export abstract class EntityLogic extends RoomObjectLogic {
    protected _entity: Entity
    public frameTracker: number = 0

    public constructor(entity: Entity) {
        super()
        this._entity = entity
    }

    public abstract onPositionChanged(): void

    public abstract onDance(): void

    public abstract onTalk(): void

    public get entity(): Entity {
        return this._entity
    }
}