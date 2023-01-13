import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData";
import { Entity } from "../../../../../core/room/object/entities/Entity";
import { EntityBuilder } from "../../../../../core/room/object/entities/EntityBuilder";
import { Engine } from "../../../../../Engine";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class LoadRoomEntities extends MessageHandler {
  public handle(): void {
    for (let readed of this.message.data) {
      let data: IEntityData = readed;

      if (
        Engine.getInstance().roomService.CurrentRoom.roomEntityRepository.get(
          data.id
        ) != null
      ) {
        return;
      }

      EntityBuilder.setId(data.id)
        .setName(data.name.name)
        .setType(data.type)
        .setFigure(data.aspect)
        .setPosition(data.position)
        .setHeadBodyRotation(data.bh_rot)
        .setUser(data.user)
        .build()
        .then((entity: Entity) => {
          if (entity) {
            Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(
              entity.id,
              entity
            );
            entity.visualization.render();
          }
        });
    }
  }
}
