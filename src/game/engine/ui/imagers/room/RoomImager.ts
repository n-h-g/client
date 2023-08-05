import { Container, Sprite, Texture } from 'pixi.js'
import RenderingUtils from '../../../../utils/RenderingUtils'
import UiUtils from '../../../../utils/UiUtils'
import Room from '../../../room/Room'
import { RoomImagerBuilder } from './RoomImagerBuilder'

export class RoomImager {
    private _roomImagerBuilder: RoomImagerBuilder

    public constructor() {
        this._roomImagerBuilder = new RoomImagerBuilder()
    }

    public async generateRoomPreview(room: Room): Promise<string> {
        if(!room) return

        let generatedRoom = this._roomImagerBuilder.setRoom(room).build()

        generatedRoom.roomLayout.Visualization.render()

        let container = new Container()

        container.addChild(generatedRoom.roomLayout.Visualization.getCanvasFloor())
        container.addChild(generatedRoom.roomLayout.Visualization.getCanvasWall())
        container.addChild(generatedRoom.roomLayout.Visualization.getCanvasDoorWall())

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                let renderingImage = UiUtils.generateImageFromObject(container)

                let texture = Texture.from(renderingImage)

                let cropped = RenderingUtils.cropTexture(texture, container.height - 200, container.width - 50, 0, 0)

                let preview = new Sprite(texture)

                preview.scale.y = 1
                preview.scale.x = 1

                preview.anchor.x = generatedRoom.roomLayout.getDoorPosition().getX() + 50
                preview.anchor.y = generatedRoom.roomLayout.getDoorPosition().getY() + 50

                setTimeout(() => {
                    let image = UiUtils.generateBase64FromObject(preview)

                    resolve(image)
                    generatedRoom.dispose()
                }, 200)
            }, 200)
        })
    }
    
    private async loadPattern(pattern) {

    }

    public get roomImagerBuilder() {
        return this._roomImagerBuilder
    }
}