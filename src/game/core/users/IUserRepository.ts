import User from '../../engine/user/User';
import { IRepository } from "../IRepository";
import IUserController from "./IUserController";

export default interface IUserRepository extends IRepository<number, User> {
    findByUsername(userName: string): IUserController | null
}