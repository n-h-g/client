import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { Engine } from "../../../../../Engine";
import { UserEntity } from '../../../../../engine/room/objects/entities/users/UserEntity';
import UserEntityVisualization from "../../../../../engine/room/objects/entities/users/visualization/UserEntityVisualization";
import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import { Logger } from "../../../../../utils/Logger";
import Point3d from "../../../../../utils/point/Point3d";
import Rotation from "../../../../../utils/Rotation";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class UpdateEntity extends MessageHandler {
    public handle(): void {
        let entityData: IEntityData = this.message;

        if(Engine.getInstance().roomService?.CurrentRoom) {
            
            let isUser = entityData.user_id != undefined;
            let entity: UserEntity
      
            if(isUser) {
                entity = Engine.getInstance().roomService?.CurrentRoom?.roomUserRepository.get(entityData.user_id)?.visualization.userEntity
            } else {
                if(Engine.getInstance().config.debug) {
                    Logger.debug("Unable to find user entity with id [" + entityData.user_id) + "]";
                }
            }

            let EntityVisualization = entity.visualization as UserEntityVisualization
           
            EntityVisualization.setPosition(new Point3d(entityData.x, entityData.y, entityData.z));
            EntityVisualization.Rot = Rotation.parseRotation(entityData.body_rot);

            if (entityData.actions.length == 0) {
                EntityVisualization.addAction(ActionId.STAND)
                return;
            }
                
            for(let action of entityData.actions) {
                action as ActionId
                EntityVisualization.addAction(action);      
            }

                
            entity.visualization.needsUpdate = true;
            
        } else {
            if(Engine.getInstance().config.debug) {
                Logger.debug("Invalid current room");
            }
        }
    }
}
