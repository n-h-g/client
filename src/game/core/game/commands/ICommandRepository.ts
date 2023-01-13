import { IRepository } from "../../IRepository";
import { ICommand } from "./ICommand";

export interface ICommandRepository extends IRepository<string, ICommand> {
    
}