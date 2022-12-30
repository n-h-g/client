import IUserVisualization from "../../../core/users/IUserVisualization";
import UserEntity from "../../room/objects/entities/users/UserEntity";
import User from "../User";

export default class UserVisualization implements IUserVisualization {

    public user: User

    public userEntity: UserEntity | null

    public constructor(user: User) {
        this.user = user;
        this.userEntity = null;
    }

    public render(): void { }
}