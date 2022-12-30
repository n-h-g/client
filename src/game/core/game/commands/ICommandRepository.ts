import { IRepository } from "../../IRepository";
import { ICommand } from "./ICommand";

export default interface ICommandRepository extends IRepository<string, ICommand> {
    
}