import IUserRepository from "../users/IUserRepository";

export default interface IRoomUserRepository extends IUserRepository{
    tick(delta: number): void
}