import { Message } from "./Message";
import { IRepository } from "../../IRepository";

export interface IChatMessageRepository extends IRepository<string, Message> {

}