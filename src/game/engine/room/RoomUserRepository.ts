import Repository from "../../core/Repository";
import IRoomUserRepository from "../../core/room/IRoomUserRepository";
import IUserController from "../../core/users/IUserController";
import User from '../user/User';

export default class RoomUserRepository extends Repository<number, User> implements IRoomUserRepository {
    private users: Map<number, User> = new Map()

    public findByUsername(userName: string): User {
        for(let user of this.users.values()) {
            if(user.userInfo.username == userName)
                return user; 
        }

        return null;
    }

    public tick(delta: number) {
        this.users.forEach((user: User) => {
            user.logic.tick(delta);
        })
    }
}