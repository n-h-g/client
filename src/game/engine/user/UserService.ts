import User from "./User";
import UserRepository from "./UserRepository";
import Service from "../../core/Service";
import IUserRepository from "../../core/users/IUserRepository";

export default class UserService extends Service<IUserRepository> {
    /**
     *  The current user in the game
     */
    private currentUser: User | null

    public _repository: UserRepository = null

    public constructor() {
        super()

        this._repository = new UserRepository()
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