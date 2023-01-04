import { Repository } from '../../core/Repository';
import { User } from '../user/User';

export class RoomUserRepository extends Repository<number, User> {
    constructor() {
        super()
    }

    public findByUsername(userName: string): User {
        for (let user of this.map.values()) {
            if (user.userInfo.username == userName)
                return user;
        }

        return null;
    }

    public tick(delta: number) {
        this.map.forEach((user: User) => {
            user.logic.tick(delta);
        })
    }
}