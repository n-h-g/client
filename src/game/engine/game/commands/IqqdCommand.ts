import { Engine } from "../../../Engine";
import Room from "../../room/Room";
import RoomVisualization from "../../room/visualization/RoomVisualization";
import Command from "./Command";

export default class IqqdCommand extends Command{
    public constructor() {
        super("iqqd")
    }

    public handle(args: string[]): void {

        let currentRoom = Engine.getInstance().roomService!.CurrentRoom;
        let RoomVisualization = (currentRoom!.getRoomLayout().Visualization as RoomVisualization)

        if(!currentRoom) {
            return;
        }

        RoomVisualization.flip()
    }
}