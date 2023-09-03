import { Container, Sprite, Texture } from 'pixi.js'
import RenderingUtils from '../../../../utils/RenderingUtils'
import UiUtils from '../../../../utils/UiUtils'
import Room from '../../../room/Room'
import { RoomImagerBuilder } from './RoomImagerBuilder'
import { Engine } from '../../../../Engine'

export class RoomImager {

    private _roomImagerBuilder: RoomImagerBuilder

    private static ROOM_PLACEHOLDER_SIZE = 10

    private static ROOM_PREVIEW_HEIGHT = 150

    private static ROOM_PREVIEW_WIDTH = 50

    private static ROOM_PREVIEW_OFFSET_TOP = 0

    private static ROOM_PREVIEW_OFFSET_LEFT = 0

    public constructor() {
        this._roomImagerBuilder = new RoomImagerBuilder()
    }

    public static getRoomPlaceHolder() {
        return Engine.getInstance().roomService.generateSquareRoomModel(10)
    }

    /**
     * Generate a room preview based of existing room.
     * @param room The room you want to generate the preview.
     * @returns 
     */
    public async generateRoomPreview(room: Room): Promise<string> {
        //TODO REFACTOR THIS
        if (!room) return

        let generatedRoom = this._roomImagerBuilder.setRoom(room).build()

        generatedRoom.roomLayout.Visualization.render()

        let container = new Container()

        container.addChild(generatedRoom.roomLayout.Visualization.getCanvasFloor())
        container.addChild(generatedRoom.roomLayout.Visualization.getCanvasWall())
        container.addChild(generatedRoom.roomLayout.Visualization.getCanvasDoorWall())
        //container.addChild(generatedRoom.roomLayout.Visualization.getCanvasDoorTile())

        let renderingImage = await UiUtils.generateBase64FromObject(container)
        let texture = Texture.from(renderingImage)
        const cropped = RenderingUtils.cropTexture(texture, container.height - RoomImager.ROOM_PREVIEW_HEIGHT, container.width - RoomImager.ROOM_PREVIEW_WIDTH, RoomImager.ROOM_PREVIEW_OFFSET_LEFT, RoomImager.ROOM_PREVIEW_OFFSET_TOP)
        let preview = Sprite.from(cropped)
        preview.scale.y = 1
        preview.scale.x = 1
        preview.anchor.x = generatedRoom.roomLayout.getDoorPosition().getX() + 50
        preview.anchor.y = generatedRoom.roomLayout.getDoorPosition().getY() + 50

        const image = await UiUtils.generateBase64FromObject(preview)
        console.log(image)
        generatedRoom.dispose()
        return image
    }

    private async loadPattern(pattern) {

    }

    public get roomImagerBuilder() {
        return this._roomImagerBuilder
    }
}