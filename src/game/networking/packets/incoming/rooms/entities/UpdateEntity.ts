import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData";
import Entity from "../../../../../core/room/object/entities/Entity";
import EntityVisualization from "../../../../../core/room/object/entities/EntityVisualization";
import { Engine } from "../../../../../Engine";
import UserEntityVisualization from "../../../../../engine/room/objects/entities/users/visualization/UserEntityVisualization";
import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import UserVisualization from "../../../../../engine/user/visualization/UserVisualization";
import { Logger } from "../../../../../utils/Logger";
import Point3d from "../../../../../utils/point/Point3d";
import Rotation from "../../../../../utils/Rotation";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class UpdateEntity extends MessageHandler {
    public handle(): void {

        let entityData: IEntityData = this.message;

        // check, it's teleport?

        if(Engine.getInstance().roomService?.CurrentRoom) {
            
            let isUser = entityData.user_id != undefined;
            let entity: Entity | null = null;
            let entityVisualization: EntityVisualization | null = null;

            if(isUser) {
                entity = ((Engine.getInstance().roomService?.CurrentRoom?.roomUserRepository.get(entityData.user_id)?.visualization as UserVisualization).userEntity);
            } else {
                if(Engine.getInstance().config.debug) {
                    Logger.debug("Unable to find user entity with id [" + entityData.user_id) + "]";
                }
            }
           
            (entity?.visualization as UserEntityVisualization).setPosition(new Point3d(entityData.x, entityData.y, entityData.z));
            entity!.visualization!.Rot = Rotation.parseRotation(entityData.body_rot);

            if (entityData.actions.length == 0) {
                entity?.visualization!.addAction(ActionId.STAND)
                return;
            }
                
            for(let action of entityData.actions) {
                action as ActionId
                entity?.visualization!.addAction(action);      
            }

                    
            entity!.visualization!.needsUpdate = true;
            
        } else {
            if(Engine.getInstance().config.debug) {
                Logger.debug("Invalid current room");
            }
        }
    }
}
