import { Engine } from "../../../../Engine";
import FloorItem from "../../../../engine/room/objects/items/FloorItem";
import WallItem from "../../../../engine/room/objects/items/WallItem";
import { UserEntity } from "../../../../engine/room/objects/users/UserEntity";
import UserEntityVisualization from "../../../../engine/room/objects/users/visualization/UserEntityVisualization";
import FurniBase from "../../../../engine/ui/imagers/items/FurniBase";
import { ItemType } from "../../../../engine/ui/imagers/items/FurniImager";
import RenderingUtils from "../../../../utils/RenderingUtils";
import { IEntityData } from "../../../communication/incoming/rooms/entities/IEntityData";
import { Entity } from "./Entity";
import { EntityType } from "./EntityType";

export class EntityFactory  {
    public static async createEntity(data: IEntityData): Promise<Entity> {
        let type: EntityType = data.type 
        let entity: Entity

        switch(type){
            case EntityType.HUMAN:
                if(data.user) {
                    let headRotation = data.bh_rot.head_rot
                    let bodyRotation = data.bh_rot.body_rot
                    entity = new UserEntity(data.id, data.name.name, data.aspect.look);
                    (entity.visualization as UserEntityVisualization).direction = bodyRotation;
                    (entity.visualization as UserEntityVisualization).headRotation = headRotation
                }
                break;
            case EntityType.ITEM:
                
                if(data.position) {
                    let base = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniBase(ItemType.FloorItem, data.name.name)
                    entity = new FloorItem(data.id, data.name.name, RenderingUtils.getPointFromObject(data.position), base)
                }
                else {
                    entity = new WallItem(data.id, data.name.name)
                }
        }

        if(data.position && entity) {
            entity.position.setX(data.position.x)
            entity.position.setY(data.position.y)
            entity.position.setZ(data.position.z)
        }

        return entity
    }
}