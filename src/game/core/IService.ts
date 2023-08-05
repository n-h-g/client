import { Repository } from './Repository';

export interface IService<S, T> {
    repository?: Repository<S, T>
}