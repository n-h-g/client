import { Engine } from "../../../../Engine";
import UiUtils from "../../../../utils/UiUtils";
import Room from "../../../room/Room";
import { RoomImagerBuilder } from "./RoomImagerBuilder";

export class RoomImager {

    /**
     * This builder is used to build room utils like plain images of the room: plain room images, patterns
     */
    private _roomImagerBuilder: RoomImagerBuilder

    public constructor() {
        this._roomImagerBuilder = new RoomImagerBuilder()

    }

    public generateRoomPreview(room: Room) {

        if(!room) return;

        let generatedRoom = this._roomImagerBuilder.setRoom(room).build()

        generatedRoom.roomLayout.Visualization.render()

        let container = generatedRoom.roomLayout.Visualization.Container
        
        let renderingImage = UiUtils.generateBase64FromObject(container)

        generatedRoom.dispose()

        return renderingImage
    }
    
    private async loadPattern(pattern) {

    }

    public get roomImagerBuilder() {
        return this._roomImagerBuilder
    }
}