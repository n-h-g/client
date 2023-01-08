import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { Entity } from "../../../../../core/room/object/entities/Entity"
import { EntityFactory } from "../../../../../core/room/object/entities/EntityFactory"
import { Engine } from "../../../../../Engine"
import { MessageHandler } from "../../../../handler/MessageHandler"

export default class AddRoomEntity extends MessageHandler {
    public handle(): void {
        let data: IEntityData = this.message

        if(Engine.getInstance().roomService.CurrentRoom.roomEntityRepository.get(data.id) != null) {
            return;
        }

        let entity: Entity = EntityFactory.createEntity(data)

        Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(entity.id, entity)

        entity.visualization.render()
    }
}
