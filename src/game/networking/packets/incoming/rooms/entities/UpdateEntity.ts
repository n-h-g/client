import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { HumanVisualization } from "../../../../../core/room/object/human/visualization/HumanVisualization";
import { Engine } from "../../../../../Engine";
import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import { Logger } from "../../../../../utils/Logger";
import Point3d from "../../../../../utils/point/Point3d";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class UpdateEntity extends MessageHandler {
    public handle(): void {
        let entityData: IEntityData = this.message

        if (Engine.getInstance().roomService?.CurrentRoom) {
            let entity = Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.get(entityData.id)

            if(!entity) return;

            if(entityData.position) {
                entity.visualization.setNextPosition(new Point3d(entityData.position.x, entityData.position.y, entityData.position.z))
                
                if(entityData.rotation) {
                    entity.visualization.Rot = entityData.rotation.rot
                } else {
                    if(entityData.bh_rot) {
                        entity.visualization.Rot = entityData.bh_rot.body_rot
                    }
                }
            }

            if(entityData.action) {
                if (entityData.action.actions.length == 0) {
                    (entity.visualization as HumanVisualization).addAction(ActionId.STAND)
                    return;
                }

                for (let action of entityData.action.actions) {
                    (entity.visualization as HumanVisualization).addAction(action);
                }
            }

            entity.visualization.needsUpdate = true
        } else {
            if (Engine.getInstance().config.debug) {
                Logger.debug("Invalid current room");
            }
        }
    }
}
