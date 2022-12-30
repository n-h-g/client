import { Engine } from "../../../Engine";
import Room from "../../room/Room";
import RoomVisualization from "../../room/visualization/RoomVisualization";
import Command from "./Command";

export default class ZoomCommand extends Command{
    public constructor() {
        super("zoom")
    }

    public handle(args: string[]): void {
        let scale = parseInt(args[0]);

        let currentRoom = Engine.getInstance().roomService!.CurrentRoom;
        let RoomVisualization = (currentRoom!.getRoomLayout().Visualization as RoomVisualization)

        RoomVisualization.zoom(scale)
    }
}