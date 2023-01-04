import { Repository } from '../../core/Repository';
import { User } from "./User";

export class UserRepository extends Repository<number, User> {
    public findByUsername(username: string): User {
        for (let user of this.map.values()) {
            if (user.userInfo.username == username)
                return user;
        }

        return null;
    }

    tick(delta: number): void {

    }
}