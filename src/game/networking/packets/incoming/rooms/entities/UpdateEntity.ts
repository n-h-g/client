import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { Engine } from "../../../../../Engine";
import { Logger } from "../../../../../utils/Logger";
import Point3d from "../../../../../utils/point/Point3d";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class UpdateEntity extends MessageHandler {
    public handle(): void {
        let entityData: IEntityData = this.message

        if (Engine.getInstance().roomService?.CurrentRoom) {
            let entity = Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.get(entityData.id)

            entity.visualization.setPosition(new Point3d(entityData.position.x, entityData.position.y, entityData.position.z))
            entity.visualization.direction = entityData.bh_rot.body_rot

            /*if (entityData.actions.length == 0) {
                EntityVisualization.addAction(ActionId.STAND)
                return;
            }

            for (let action of entityData.actions) {
                EntityVisualization.addAction(action);
            }*/

            entity.visualization.needsUpdate = true
        } else {
            if (Engine.getInstance().config.debug) {
                Logger.debug("Invalid current room");
            }
        }
    }
}
