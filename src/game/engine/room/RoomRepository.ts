import Repository from "../../core/Repository";
import IRoomRepository from "../../core/room/IRoomRepository";
import Room from "./Room";

export default class RoomRepository extends Repository<number, Room> implements IRoomRepository {
    
    tick(delta: number): void {
        throw new Error("Method not implemented.");
    }    
}