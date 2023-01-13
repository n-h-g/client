import UiUtils from "../../../../utils/UiUtils";
import { RoomImagerBuilder } from "./RoomImagerBuilder";

export class RoomImager {

    /**
     * This builder is used to build room utils like plain images of the room: plain room images, patterns
     */
    private _roomImagerBuilder: RoomImagerBuilder

    public constructor() {
        this._roomImagerBuilder = new RoomImagerBuilder()
    }

    public async generateRoomPreview(room) {
        let generatedRoom = this._roomImagerBuilder.setRoom(room).build()

        let container = generatedRoom.roomLayout.Visualization.Container
        
        let renderingImage = UiUtils.generateImageFromObject(container)

        generatedRoom.dispose()

        return renderingImage
    }
    
    private async loadPattern(pattern) {

    }

    public get roomImagerBuilder() {
        return this._roomImagerBuilder
    }
}