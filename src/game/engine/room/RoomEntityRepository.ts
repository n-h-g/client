import { Repository } from '../../core/Repository';
import { Entity } from '../../core/room/object/entities/Entity';
import { UserEntity } from './objects/users/UserEntity';

export class RoomEntityRepository extends Repository<string, Entity> {
    public constructor() {
        super()
    }

    public tick(delta: number) {
        this.map.forEach((entity: Entity) => {
            entity.logic.tick(delta);
        })
    }
}