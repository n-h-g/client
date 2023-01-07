import { EntityEvents } from '../../../../engine/events/room/objects/entities/EntityEvents';
import { RoomObjectLogic } from '../RoomObjectLogic';
import { Entity } from "./Entity";

export abstract class EntityLogic extends RoomObjectLogic {
    protected _entity: Entity
    
    protected frameTracker: number = 0

    public constructor(entity: Entity) {
        super()
        this._entity = entity
    }

    public registerEvents(): void {
        this.events.on(EntityEvents.POSITION_CHANGED, () => this.onPositionChanged())
    }

    public abstract onPositionChanged(): void

    public abstract onLoad(): void

    public get entity(): Entity {
        return this._entity
    }
}