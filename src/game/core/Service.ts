import Repository from "./Repository";

export default abstract class Service<IRepository> {
    
    public repository?: Repository<any, any>

    public constructor() {
        this.repository = new Repository();
    }
}