import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData"
import { Entity } from "../../../../../core/room/object/entities/Entity"
import { EntityBuilder } from "../../../../../core/room/object/entities/EntityBuilder"
import { Engine } from "../../../../../Engine"
import { MessageHandler } from "../../../../handler/MessageHandler"

export default class AddRoomEntity extends MessageHandler {
  public handle(): void {
    let data: IEntityData = this.message

    if (Engine.getInstance()?.roomService?.CurrentRoom?.roomEntityRepository?.get(data.id) != null)
      return;

    let builder = new EntityBuilder()

    builder.setId(data.id)
      .setName(data.name.name)
      .setType(data.type)
      .setFigure(data.aspect)
      .setPosition(data.position)
      .setHeadBodyRotation(data.bh_rot)
      .setUser(data.user)
      .build()
      .then((entity: Entity) => {
        Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(
          entity.id,
          entity
        );
        entity.visualization.render()
      });
  }
}
