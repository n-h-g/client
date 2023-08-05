import { Repository } from '../../core/Repository'
import { Entity } from '../../core/room/object/entities/Entity'

export class RoomEntityRepository extends Repository<string, Entity> {
    public constructor() {
        super()
    }

    public tick(delta: number) {
        this.getAll().forEach((entity: Entity) => {
            entity.logic.tick(delta)
        })
    }
}