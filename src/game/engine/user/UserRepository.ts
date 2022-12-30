import Repository from "../../core/Repository";
import IUserController from "../../core/users/IUserController";
import IUserRepository from "../../core/users/IUserRepository";
import User from "./User";

export default class UserRepository extends Repository<number, User> implements IUserRepository {

    public findByUsername(username: string): IUserController | null {
        for(let user of this.map.values()) {
            user as User
            if(user.userInfo.username == username)
                return user; 
        }

        return null;
    }

    tick(delta: number): void {
        throw new Error("Method not implemented.");
    }

}