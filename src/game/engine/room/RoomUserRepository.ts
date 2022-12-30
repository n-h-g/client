import Repository from "../../core/Repository";
import IRoomUserRepository from "../../core/room/IRoomUserRepository";
import IUserController from "../../core/users/IUserController";
import UserLogic from "../user/logic/UserLogic";

export default class RoomUserRepository extends Repository<number, IUserController> implements IRoomUserRepository {

    private users: Map<number, IUserController> = new Map()

    public findByUsername(userName: string): IUserController | null {
        for(let user of this.users.values()) {
            user as IUserController
            if(user.userInfo.username == userName)
                return user; 
        }

        return null;
    }


    public tick(delta: number) {
        this.users.forEach((user: IUserController) => {
            (user.logic as UserLogic).tick(delta);
        })
    }
}