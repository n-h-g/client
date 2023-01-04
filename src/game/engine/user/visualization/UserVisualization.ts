import { UserEntity } from '../../room/objects/entities/users/UserEntity';
import { User } from '../User';

export class UserVisualization {
    public user: User
    public userEntity: UserEntity

    public constructor(user: User) {
        this.user = user;
        this.userEntity = null;
    }

    public render(): void { }
}