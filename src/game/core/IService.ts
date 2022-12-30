import { IRepository } from "./IRepository";
import Repository from "./Repository";

export default interface IService<S, T> {
    repository?: Repository<S, T>
}