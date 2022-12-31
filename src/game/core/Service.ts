import Repository from "./Repository";

export default abstract class Service<IRepository> {
    public _repository?: Repository<any, any>

    public constructor() {
        this._repository = new Repository();
    }

    public get repository(): Repository<any, any> {
        return this._repository
    }

    public set repository(repository: Repository<any, any>) {
        this._repository = repository
    }
}