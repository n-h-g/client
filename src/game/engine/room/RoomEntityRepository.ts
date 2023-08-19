import { Repository } from '../../core/Repository'
import { MoveableLogic, MoveableVisualization, isMoveable } from '../../core/room/object/IMoveable'
import { Entity } from '../../core/room/object/entities/Entity'
import Point3d from '../../utils/point/Point3d'
import { EntityEvents } from '../events/room/objects/entities/EntityEvents'

export class RoomEntityRepository extends Repository<string, Entity> {

    public rollingEntity: Entity

    public constructor() {
        super()

        this.rollingEntity = null;
    }

    public isEntityRolling(): boolean {
        if(this.rollingEntity != null)
            return true;
    }

    public stopRollingEntity() {
        if(this.rollingEntity == null) return;

        this.rollingEntity.logic.events.emit(EntityEvents.STOP_ROLL)

        this.rollingEntity = null;
    }

    public updateRollingEntity(position: Point3d) {

        if(!this.rollingEntity) return;

        this.rollingEntity.visualization.setNextPosition(position)

        this.rollingEntity.logic.events.emit(EntityEvents.START_ROLL)
    }

    public setRollingEntity(entity: Entity) {

        if(entity == null) return;

        this.rollingEntity = entity;
    }

    public tick(delta: number) {
        this.getAll().forEach((entity: Entity) => {
            entity.logic.tick(delta)
        })
    }
}