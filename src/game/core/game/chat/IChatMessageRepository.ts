import { Message } from "./Message";
import { IRepository } from "../../IRepository";

export default interface IChatMessageRepository extends IRepository<string, Message> {

}