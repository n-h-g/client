import FloorItem from "../../../../engine/room/objects/items/FloorItem";
import WallItem from "../../../../engine/room/objects/items/WallItem";
import { UserEntity } from "../../../../engine/room/objects/users/UserEntity";
import UserEntityVisualization from "../../../../engine/room/objects/users/visualization/UserEntityVisualization";
import RenderingUtils from "../../../../utils/RenderingUtils";
import { IEntityData } from "../../../communication/incoming/rooms/entities/IEntityData";
import { Entity } from "./Entity";
import { EntityType } from "./EntityType";

export class EntityFactory  {
    public static createEntity(data: IEntityData): Entity {
        let type: EntityType = data.type 
        let entity: Entity

        switch(type){
            case EntityType.HUMAN:
                if(data.user) {
                    let headRotation = data.bh_rot.head_rot
                    let bodyRotation = data.bh_rot.body_rot
                    entity = new UserEntity(data.id, data.name, data.aspect.look);
                    (entity.visualization as UserEntityVisualization).direction = bodyRotation;
                    (entity.visualization as UserEntityVisualization).headRotation = headRotation
                    
                }
                break;
            case EntityType.ITEM:
                if(data.position)
                    return new FloorItem(data.id, data.name, RenderingUtils.getPointFromObject(data.position))
                else
                    return new WallItem(data.id, data.name)
        }

        entity.position.setX(data.position.x)
        entity.position.setY(data.position.y)
        entity.position.setZ(data.position.z)

        return entity
    }
}