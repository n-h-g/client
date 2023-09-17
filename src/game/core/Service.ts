import {IService} from './IService';
import {Repository} from './Repository';

export abstract class Service<S, T> implements IService<S, T> {
    repository?: Repository<S, T>;
}
