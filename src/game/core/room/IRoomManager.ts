import IService from "../IService";
import IRoomController from "./IRoomController";
import IRoomRepository from "./IRoomRepository";

export default interface IRoomService extends IService<IRoomController, IRoomRepository> {

}