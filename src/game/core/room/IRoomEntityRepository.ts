import { IRepository } from "../IRepository";
import Entity from "./object/entities/Entity";

export default interface IRoomEntityRepository extends IRepository<string, Entity> {

}