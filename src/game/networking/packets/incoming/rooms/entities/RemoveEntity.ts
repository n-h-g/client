import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { Entity } from "../../../../../core/room/object/entities/Entity"
import { EntityFactory } from "../../../../../core/room/object/entities/EntityFactory"
import { Engine } from "../../../../../Engine"
import { MessageHandler } from "../../../../handler/MessageHandler"

export default class RemoveEntity extends MessageHandler {
    public handle(): void {
        let data: IEntityData = this.message

        let entity: Entity = Engine.getInstance().roomService.CurrentRoom.roomEntityRepository.get(data.id)

        if(entity != null) {
            return;
        }

        entity.dispose()
    }
}
