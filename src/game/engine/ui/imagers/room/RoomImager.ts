import {Container, Sprite, Texture} from 'pixi.js';
import {RenderingUtils} from '../../../../utils/RenderingUtils';
import {UiUtils} from '../../../../utils/UiUtils';
import {Room} from '../../../room/Room';
import {RoomImagerBuilder} from './RoomImagerBuilder';
import {Engine} from '../../../../Engine';
import { RoomChatData } from '../../../events/ui/data/room/RoomChatData';

export class RoomImager {
    private wrappedRoomImagerBuilder: RoomImagerBuilder;

    private static ROOM_PLACEHOLDER_SIZE = 10;

    private static ROOM_PREVIEW_HEIGHT = 150;

    private static ROOM_PREVIEW_WIDTH = 50;

    private static ROOM_PREVIEW_OFFSET_TOP = 0;

    private static ROOM_PREVIEW_OFFSET_LEFT = 0;

    constructor() {
        this.wrappedRoomImagerBuilder = new RoomImagerBuilder();
    }

    static getRoomPlaceHolder() {
        return Engine.getInstance().roomService.generateSquareRoomModel(8);
    }

    /**
     * Generate a room preview based of existing room.
     * @param room The room you want to generate the preview.
     * @returns
     */
    public async generateRoomPreview(room: Room): Promise<string> {
        //TODO REFACTOR THIS
        if (!room) return;

        const generatedRoom = this.wrappedRoomImagerBuilder.setRoom(room).build();

       	generatedRoom.roomLayout.visualization.render();

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                let renderingImage =
					await UiUtils.generateImageFromObject(generatedRoom.roomLayout.visualization.container);

                let texture = Texture.from(renderingImage);

                const cropped = RenderingUtils.cropTexture(
					texture,
					generatedRoom.roomLayout.visualization.container.height - RoomImager.ROOM_PREVIEW_HEIGHT,
					generatedRoom.roomLayout.visualization.container.width - RoomImager.ROOM_PREVIEW_WIDTH,
					RoomImager.ROOM_PREVIEW_OFFSET_LEFT,
					RoomImager.ROOM_PREVIEW_OFFSET_TOP
				);

                let preview = Sprite.from(cropped);

                preview.scale.y = 1;
                preview.scale.x = 1;

                preview.anchor.x = generatedRoom.roomLayout.getDoorPosition().x + 50;
                preview.anchor.y = generatedRoom.roomLayout.getDoorPosition().y + 50;

                setTimeout(async () => {
                    let image = await UiUtils.generateBase64FromObject(preview);

                    resolve(image);
                    generatedRoom.dispose();
                }, 200)
            }, 200)
        })
    }

    private async loadPattern(pattern) {}

    get roomImagerBuilder() {
        return this.wrappedRoomImagerBuilder;
    }
}
