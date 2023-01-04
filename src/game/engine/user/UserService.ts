import { User } from "./User";
import { Service } from '../../core/Service';

export class UserService extends Service<number, User> {
    /**
     *  The current user in the game
     */
    private currentUser: User

    constructor() {
        super()
    }

    public setUp(): void {
        let user = new User(-1, "", "hd", "M");
        this.setUser(user);
    }

    public setUser(user: User): User {
        this.currentUser = user;
        return this.currentUser;
    }

    public get CurrentUser(): User | null {
        return this.currentUser;
    }

    public set CurrentUser(user: User | null) {
        this.currentUser = user;
    }

    public tick(delta: number) {
       
    }
}