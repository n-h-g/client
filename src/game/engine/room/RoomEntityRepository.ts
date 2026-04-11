import {Repository} from '../../core/Repository';
import {Entity} from '../../core/room/object/entities/Entity';
import {Point3d} from '../../utils/point/Point3d';
import {EntityEvents} from '../events/room/objects/entities/EntityEvents';

export class RoomEntityRepository extends Repository<string, Entity> {
    rollingEntity: Entity;

    constructor() {
        super();
    }

    public getEntityAt(x: number, y: number): Entity | undefined {
        for (const entity of this.getAll().values()) {
            if (Math.floor(entity.position.x) === Math.floor(x) &&
                Math.floor(entity.position.y) === Math.floor(y)) {
                return entity;
            }
        }
        return undefined;
    }
    
    public getEntitiesAt(x: number, y: number): Entity[] {
        return Array.from(this.getAll().values()).filter((entity: Entity) => {
            return Math.floor(entity.position.x) === Math.floor(x) &&
                Math.floor(entity.position.y) === Math.floor(y);
        });
    }

    isEntityRolling(): boolean {
        return this.rollingEntity != null ? true : false;
    }

    stopRollingEntity() {
        if (this.rollingEntity == null) return;

        this.rollingEntity.logic.events.emit(EntityEvents.STOP_ROLL);

        this.rollingEntity = null;
    }

    updateRollingEntity(position: Point3d) {
        if (this.rollingEntity == null) return;

        this.rollingEntity.visualization.setNextPosition(position);

        this.rollingEntity.logic.events.emit(EntityEvents.START_ROLL);
    }

    setRollingEntity(entity: Entity) {
        if (entity == null) return;

        this.rollingEntity = entity;
    }

    tick(delta: number) {
        this.getAll().forEach((entity: Entity) => {
            entity.logic.tick(delta);
        });
    }
}
