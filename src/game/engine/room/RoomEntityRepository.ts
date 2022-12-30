import Repository from "../../core/Repository";
import IRoomEntityRepository from "../../core/room/IRoomEntityRepository";
import Entity from "../../core/room/object/entities/Entity";
import EntityLogic from "../../core/room/object/entities/EntityLogic";

export default class RoomEntityRepository extends Repository<string, Entity> implements IRoomEntityRepository {

    public constructor() {
        super()
    }

    public tick(delta: number) {
        this.map.forEach((entity: Entity) => {
            (entity.logic as EntityLogic).tick(delta);
        })
    }
}