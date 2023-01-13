import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { Entity } from "../../../../../core/room/object/entities/Entity"
import { Engine } from "../../../../../Engine"
import { MessageHandler } from "../../../../handler/MessageHandler"

export default class RemoveEntity extends MessageHandler {
    public handle(): void {
        let data: string = this.message.data

        let entity: Entity = Engine.getInstance().roomService.CurrentRoom.roomEntityRepository.get(data)

        if(entity == null) {
            return;
        }

        entity.dispose()
    }
}
