import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData";
import { EntityType } from "../../../../../core/room/object/entities/EntityType";
import { Engine } from "../../../../../Engine";
import { UserEntity } from '../../../../../engine/room/objects/users/UserEntity';
import Rotation from "../../../../../utils/Rotation";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class LoadRoomEntities extends MessageHandler {
    public handle(): void {
        for (let i = 0; i < this.message.data.length; i++) {
            let entityData: IEntityData = this.message.data[i];

            let userId: number = entityData.user_id

            let isUser = userId !== undefined;

            if (Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.get(entityData.id.toString()) !== null) {
                return;
            }

            if (entityData.type === EntityType.HUMAN && isUser) {
                let entity = new UserEntity(entityData.id.toString(), entityData.name, entityData.look, Engine.getInstance()?.roomService?.CurrentRoom!);

                entity.position.setX(entityData.x);
                entity.position.setY(entityData.y);
                entity.position.setZ(entityData.z);

                entity.visualization.Rot = Rotation.parseRotation(entityData.body_rot);
                entity.visualization.headRotation = Rotation.parseRotation(entityData.body_rot);

                Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(entity.id, entity)
                entity?.visualization?.render()
            }
        }
    }
}

