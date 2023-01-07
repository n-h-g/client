import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { Engine } from "../../../../../Engine";
import { UserEntity } from '../../../../../engine/room/objects/users/UserEntity';
import UserEntityVisualization from "../../../../../engine/room/objects/users/visualization/UserEntityVisualization";
import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import { Logger } from "../../../../../utils/Logger";
import Point3d from "../../../../../utils/point/Point3d";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class UpdateEntity extends MessageHandler {
    public handle(): void {
        let entityData: IEntityData = this.message;

        if (Engine.getInstance().roomService?.CurrentRoom) {
            let entity: UserEntity
            let EntityVisualization = entity.visualization as UserEntityVisualization

            EntityVisualization.setPosition(new Point3d(entityData.position.x, entityData.position.y, entityData.position.z))
            EntityVisualization.direction = entityData.bh_rot.body_rot

            if (entityData.actions.length == 0) {
                EntityVisualization.addAction(ActionId.STAND)
                return;
            }

            for (let action of entityData.actions) {
                EntityVisualization.addAction(action);
            }


            entity.visualization.needsUpdate = true;

        } else {
            if (Engine.getInstance().config.debug) {
                Logger.debug("Invalid current room");
            }
        }
    }
}
