import {EntityData} from '../../../../../core/communication/incoming/rooms/entities/EntityData';
import {Entity} from '../../../../../core/room/object/entities/Entity';
import {EntityBuilder} from '../../../../../core/room/object/entities/EntityBuilder';
import {Engine} from '../../../../../Engine';
import {MessageHandler} from '../../../../handler/MessageHandler';

export class AddRoomEntity extends MessageHandler {
    handle(): void {
        const data: EntityData = this.message;

        if (
            Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository?.get(
                data.id
            ) != null
        )
            return;

        const builder = new EntityBuilder();

        builder
            .setId(data.id)
            .setName(data.name.name)
            .setType(data.type)
            .setFigure(data.aspect)
            .setPosition(data.position)
            .setHeadBodyRotation(data.bh_rot)
            .setUser(data.user)
            .build()
            .then((entity: Entity) => {
                Engine.getInstance().roomService?.currentRoom?.roomEntityRepository.add(
                    entity.id,
                    entity
                );
                entity.visualization.render();
            });
    }
}
