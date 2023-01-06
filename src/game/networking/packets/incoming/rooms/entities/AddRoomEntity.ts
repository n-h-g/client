import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { EntityType } from "../../../../../core/room/object/entities/EntityType"
import { Engine } from "../../../../../Engine"
import { UserEntity } from "../../../../../engine/room/objects/users/UserEntity"
import Rotation from "../../../../../utils/Rotation"
import { MessageHandler } from "../../../../handler/MessageHandler"

export default class AddRoomEntity extends MessageHandler {
    public handle(): void {
        let entityData: IEntityData = this.message
        let entity: UserEntity
        
        if (Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.get(entityData.id.toString()) !== null) {
            return
        }

        if (entityData.type === EntityType.HUMAN && entityData.user_id != undefined) {
            entity = new UserEntity(entityData.id.toString(), entityData.name, entityData.look, Engine.getInstance().roomService?.CurrentRoom!)

            entity.position.setX(entityData.x)
            entity.position.setY(entityData.y)
            entity.position.setZ(entityData.z)

            entity.visualization.Rot = Rotation.parseRotation(entityData.rot)
            entity.visualization.headRotation = Rotation.parseRotation(entityData.rot)
        }

        if (entity) {
            Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(entity.id, entity)
            entity.visualization.render()
        }
    }
}
