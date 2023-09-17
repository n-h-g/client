import {IService} from './IService';
import {Repository} from './Repository';

export abstract class Service<S, T> implements IService<S, T> {
    public repository?: Repository<S, T>;
}
