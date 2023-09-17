import {IEntityData} from '../../../../../core/communication/incoming/rooms/entities/IEntityData';
import {HumanVisualization} from '../../../../../core/room/object/human/visualization/HumanVisualization';
import {Engine} from '../../../../../Engine';
import {ActionId} from '../../../../../engine/ui/imagers/avatars/enum/actions/ActionId';
import {Logger} from '../../../../../utils/Logger';
import {Point3d} from '../../../../../utils/point/Point3d';
import {MessageHandler} from '../../../../handler/MessageHandler';

export class UpdateEntity extends MessageHandler {
    handle(): void {
        const entityData: IEntityData = this.message;

        if (Engine.getInstance().roomService?.CurrentRoom) {
            const entity =
                Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.get(
                    entityData.id
                );

            if (!entity) return;

            if (entityData.position) {
                if (entityData.rotation) {
                    entity.visualization.updateRotation(
                        entityData.rotation.rot
                    );
                } else {
                    if (entityData.bh_rot) {
                        entity.visualization.Rot = entityData.bh_rot.body_rot;
                    }
                }

                entity.visualization.setNextPosition(
                    new Point3d(
                        entityData.position.x,
                        entityData.position.y,
                        entityData.position.z
                    )
                );

                entity.visualization.needsUpdate =
                    (entity.position.x != entityData.position.x &&
                        entity.position.y != entityData.position.y) ||
                    entityData.aspect != undefined;
            }

            if (entityData.action) {
                if (entityData.action.actions.length == 0) {
                    (entity.visualization as HumanVisualization).addAction(
                        ActionId.STAND
                    );
                    return;
                }

                for (const action of entityData.action.actions) {
                    (entity.visualization as HumanVisualization).addAction(
                        action
                    );
                }

                entity.visualization.needsUpdate = true;
            }
        } else {
            if (Engine.getInstance().config.debug) {
                Logger.debug('Invalid current room');
            }
        }
    }
}
