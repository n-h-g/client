import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData";
import { Entity } from "../../../../../core/room/object/entities/Entity";
import { EntityFactory } from "../../../../../core/room/object/entities/EntityFactory";
import { EntityType } from "../../../../../core/room/object/entities/EntityType";
import { Engine } from "../../../../../Engine";
import { UserEntity } from '../../../../../engine/room/objects/users/UserEntity';
import Rotation from "../../../../../utils/Rotation";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class LoadRoomEntities extends MessageHandler {
    public handle(): void {
        for (let i = 0; i < this.message.data.length; i++) {
            let data: IEntityData = this.message.data[i];

            let entity: Entity = EntityFactory.createEntity(data)

            Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(entity.id, entity)

            entity.visualization.render()
        }
    }
}

