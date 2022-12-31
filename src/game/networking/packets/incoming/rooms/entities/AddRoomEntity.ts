import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData";
import Entity from "../../../../../core/room/object/entities/Entity";
import { EntityType } from "../../../../../core/room/object/entities/EntityType";
import EntityVisualization from "../../../../../core/room/object/entities/EntityVisualization";
import { Engine } from "../../../../../Engine";
import UserEntity from "../../../../../engine/room/objects/entities/users/UserEntity";
import UserEntityVisualization from "../../../../../engine/room/objects/entities/users/visualization/UserEntityVisualization";
import User from "../../../../../engine/user/User";
import UserVisualization from "../../../../../engine/user/visualization/UserVisualization";
import Rotation from "../../../../../utils/Rotation";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class AddRoomEntity extends MessageHandler {
    public handle(): void {
        let entityData: IEntityData = this.message;

        let entity: Entity | null = null;
        let entityVisualization: EntityVisualization | null = null;

        if(Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.get(entityData.id.toString()) !== undefined) {
            return;
        }

        if(entityData.type === EntityType.HUMAN && entityData.user_id != undefined) {
            entity = new UserEntity(entityData.id.toString(), entityData.name, entityData.look, Engine.getInstance().roomService?.CurrentRoom!);
            entityVisualization =  (entity?.visualization) as UserEntityVisualization;
            
            entity.position.setX(entityData.x);
            entity.position.setY(entityData.y);
            entity.position.setZ(entityData.z);

            entity.visualization!.Rot = Rotation.parseRotation(entityData.rot);
            entity.visualization!.HeadRot = Rotation.parseRotation(entityData.rot);
            (entity as UserEntity).Look = entityData.look;
            //tmpUser.!.Gender = user.gender;
            entityVisualization.inRoom = true;

            let user = Engine.getInstance().roomService?.CurrentRoom?.roomUserRepository.get(entityData.user_id);
            

            if(!user) {
                
                let currentUser = Engine.getInstance().usersService.repository.get(entityData.user_id);

                    if(currentUser == undefined) {
                        currentUser = new User(entityData.user_id, entityData.name, entityData.look, entityData.gender);
                    }

                    Engine.getInstance().roomService?.CurrentRoom?.roomUserRepository.add(currentUser.userInfo.id, currentUser);
                    (currentUser.visualization as UserVisualization).userEntity = entity as UserEntity;
                    (entity as UserEntity).user = currentUser;
                
            }

        }

        if(entity) {
            Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(entity.id, entity);
            entityVisualization?.render();
        }

    }
}
