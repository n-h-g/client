
import { IRepository } from "../IRepository";
import IUserController from "./IUserController";

export default interface IUserRepository extends IRepository<number, IUserController> {
    findByUsername(userName: string): IUserController | null
}