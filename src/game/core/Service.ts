import { Repository } from "./Repository";

export abstract class Service<S, T> {
    public _repository?: Repository<S, T>

    public constructor() {
        this._repository = new Repository();
    }

    public get repository(): Repository<S, T> {
        return this._repository
    }

    public set repository(repository: Repository<S, T>) {
        this._repository = repository
    }
}