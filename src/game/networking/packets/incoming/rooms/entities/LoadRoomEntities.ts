import { IEntityData } from "../../../../../core/communication/incoming/rooms/entities/IEntityData";
import Entity from "../../../../../core/room/object/entities/Entity";
import { EntityType } from "../../../../../core/room/object/entities/EntityType";
import EntityVisualization from "../../../../../core/room/object/entities/EntityVisualization";
import IUserController from "../../../../../core/users/IUserController";
import { Engine } from "../../../../../Engine";
import UserEntity from "../../../../../engine/room/objects/entities/users/UserEntity";
import User from "../../../../../engine/user/User";
import UserVisualization from "../../../../../engine/user/visualization/UserVisualization";
import Rotation from "../../../../../utils/Rotation";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class LoadRoomEntities extends MessageHandler
{
    public handle(): void {
        for (let i = 0; i < this.message.data.length; i++)
        {
            let entityData: IEntityData = this.message.data[i];

            let entity: Entity | null = null;
            let entityVisualization: EntityVisualization | null = null;
            let user: IUserController | undefined;

            let userId: number = entityData.user_id

            let isUser = userId !== undefined;

            if(Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.get(entityData.id.toString()) !== null) {
                return;
            }
    

            if(entityData.type === EntityType.HUMAN && isUser) {

                entity = new UserEntity(entityData.id.toString(), entityData.name, entityData.look, Engine.getInstance().roomService?.CurrentRoom!); 

                    
                entity.position.setX(entityData.x);
                entity.position.setY(entityData.y);
                entity.position.setZ(entityData.z);

                entity.visualization!.Rot = Rotation.parseRotation(entityData.body_rot);
                    //todo headRot
                entity.visualization!.HeadRot = Rotation.parseRotation(entityData.body_rot);
                entity.visualization!.inRoom = true;

                user = Engine.getInstance().roomService?.CurrentRoom?.roomUserRepository.get(userId)

                if(!user) {

                    let currentUser = Engine.getInstance().usersService.repository?.get(userId);

                    if(currentUser == undefined) {
                        currentUser = new User(userId, entityData.name, entityData.look, entityData.gender);
                    }

                    Engine.getInstance().roomService?.CurrentRoom?.roomUserRepository.add(userId, currentUser);
                    (currentUser.visualization as UserVisualization).userEntity = entity as UserEntity;
                    (entity as UserEntity).user = currentUser;
                    (currentUser.visualization as UserVisualization).userEntity?.visualization?.render()
                    
                }
            }

            if(entity) {
                Engine.getInstance().roomService?.CurrentRoom?.roomEntityRepository.add(entity.id, entity);
            }
    
       }
    }
}

