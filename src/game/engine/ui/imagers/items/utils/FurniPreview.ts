import {Container, Graphics} from 'pixi.js';
import {Engine} from '../../../../../Engine';
import {UiUtils} from '../../../../../utils/UiUtils';
import {FurnidataItemType} from '../enum/FurniDataItemType';
import {Room} from '../../../../room/Room';
import {Point} from '../../../../../utils/point/Point';
import {Point3d} from '../../../../../utils/point/Point3d';
import {MapData} from '../../../../room/objects/map/MapData';
import {RoomVisualization} from '../../../../room/visualization/RoomVisualization';
import {RoomPriority} from '../../../../room/visualization/RoomPriority';
import {RoomDecorationLibrary} from '../../../../room/decoration/RoomDecorationLibrary';
import {FurniData} from '../FurniData';
import {FurniImager} from '../FurniImager';
import {WallItem} from '../../../../room/objects/items/WallItem';
import {FurnitureWallData} from '../../../../room/objects/items/WallItemData';
import {TileType} from '../../../../room/objects/map/TileTypeEnum';
import {WallType} from '../../../../room/objects/map/WallTypeEnum';

/**
 * Image (base64) of a furni in its default direction, for the UI previews (catalogue, inventory).
 */
export class FurniPreview {
    private static nextPreviewRoomId = -1;
    /**
     * @param name the furni name, with the color variant (chair_plasto*2).
     * @param type floor or wall furni.
     * @param background the color of the panel showing the image: the layers with ink ADD (glows) are black
     *                   where they add nothing, on a transparent background they would leave a black box.
     */
    static async render(name: string, background = 0xffffff, type = FurnidataItemType.FloorItem): Promise<string | null> {
        const furniImager = Engine.getInstance()?.userInterfaceManager?.furniImager;
        if (!furniImager) return null;

        const sprite = await furniImager.loadFurniSprite(type, name);
        if (!sprite) return null;

        await sprite.init();
        sprite.setDirection(sprite.furniBase.getUIDirection());
        sprite.update(true);

        const bounds = sprite.container.getLocalBounds();
        const backgroundRect = new Graphics();
        backgroundRect.beginFill(background);
        backgroundRect.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
        backgroundRect.endFill();

        const scene = new Container();
        scene.addChild(backgroundRect, sprite.container);

        const image = await UiUtils.generateBase64FromObject(scene);
        scene.destroy({children: true});

        return image;
    }

    /** Render the offer and report its focus point in the resulting image. */
    static async renderRoom(
        name: string,
        extraData?: string | null,
        /** The still image, as soon as it's drawn (the frames of the animation take longer). */
        onStillImage?: (still: {image: string; width: number; height: number; focusX: number; focusY: number}) => void,
        /** True: the preview isn't wanted anymore (another furni chosen): the frames are not drawn. */
        isCancelled?: () => boolean,
    ): Promise<{
        image: string;
        width: number;
        height: number;
        focusX: number;
        focusY: number;
        frames?: string[];
        /** How long each frame stays (ms): the animation at the speed of the room, each state for a while. */
        frameDurations?: number[];
    } | null> {
        const engine = Engine.getInstance();
        const furniImager = engine?.userInterfaceManager?.furniImager;
        if (!engine || !furniImager) return null;

        const roomService = engine.roomService;
        const currentRoom = roomService.currentRoom;
        const model = currentRoom?.roomInfo.roomModel || roomService.generateSquareRoomModel(7);
        const doorPosition = currentRoom?.roomLayout.getDoorPosition() ?? new Point(0, 0);
        const room = new Room('catalogue-preview', model, doorPosition, this.nextPreviewRoomId--, '');
        const roomContainer = room.roomLayout.visualization.container;
        let focus: Point | null = null;
        let animatedSprite: Awaited<ReturnType<typeof furniImager.loadFurniSprite>> | null = null;

        try {
            await room.roomLayout.visualization.render();
            roomContainer.position.set(0, 0);

            if (currentRoom) {
                await room.roomLayout.setDecorations(currentRoom.roomLayout.getDecorationIds());
            }

            const decorationType = name.toLowerCase().match(/^(wallpaper|floor|landscape)(?:_|$)/)?.[1] as
                'wallpaper' | 'floor' | 'landscape' | undefined;
            if (decorationType && extraData) {
                const decoration = decorationType === 'wallpaper'
                    ? {wallpaper: extraData}
                    : decorationType === 'floor'
                        ? {floor: extraData}
                        : {landscape: extraData};
                await room.roomLayout.setDecorations(decoration);
            } else {
                const furnidata = furniImager.getFurnidata();
                const isWallItem = Object.values(furnidata.wallItems).some(
                    (item: any) => item.className === name
                );
                const type = isWallItem ? FurnidataItemType.WallItem : FurnidataItemType.FloorItem;
                const sprite = await furniImager.loadFurniSprite(type, name);
                if (!sprite) return null;

                await sprite.init();
                animatedSprite = sprite;
                const direction = sprite.furniBase.getUIDirection();
                sprite.setDirection(direction);
                sprite.update(true);

                if (isWallItem) {
                    // Use an actual segment from this room's wall plane. Invented wall
                    // coordinates (or floor coordinates) make wall furni render at the
                    // room edge, detached from the wall.
                    const walls = room.roomLayout.getWallPlane().getWalls();
                    if (!walls.length) return null;

                    const roomCenterX = (room.roomLayout.getMapSizeX() * MapData.tileWidth) / 2;
                    const roomCenterY = (room.roomLayout.getMapSizeY() * MapData.tileHeight) / 2;
                    const wall = walls.reduce((closest, candidate) => {
                        const candidateX = candidate.visualization.offsetX + MapData.tileWidth / 4;
                        const candidateY = candidate.visualization.offsetY + MapData.wallHeight / 2;
                        const closestX = closest.visualization.offsetX + MapData.tileWidth / 4;
                        const closestY = closest.visualization.offsetY + MapData.wallHeight / 2;
                        return Math.hypot(candidateX - roomCenterX, candidateY - roomCenterY) <
                            Math.hypot(closestX - roomCenterX, closestY - roomCenterY) ? candidate : closest;
                    });
                    const isLeftWall = wall.type === WallType.Left || wall.type === WallType.DoorLeft;
                    const localX = MapData.tileWidth / 4;
                    const wallLocalY = wall.visualization.offsetY + MapData.wallHeight / 2;
                    const localY = Math.max(0, Math.round(
                        wall.visualization.offsetY + MapData.wallHeight + 120 + localX / 2 +
                        wall.position.z * MapData.thickSpace * MapData.stairSteps - wallLocalY
                    ));
                    const wallData = new FurnitureWallData({
                        width: wall.position.x,
                        height: wall.position.y,
                        localX,
                        localY,
                        direction: isLeftWall ? 2 : 4,
                        side: isLeftWall ? 'l' : 'r',
                        stuffData: '0',
                        secondsToExpiration: -1,
                        y: 0,
                        z: 0,
                        isOldFormat: false,
                    });
                    const wallItem = new WallItem('catalogue-preview-item', name, sprite.furniBase, wallData);
                    wallItem.setPlacement(wall, localX, localY);
                    sprite.container.position.set(wallItem.calculateOffsetX(), wallItem.calculateOffsetY());
                    sprite.container.zIndex = RoomVisualization.calculateZIndex(
                        wall.position,
                        RoomPriority.WALL_ITEM
                    );
                } else {
                    const itemWidth = Math.max(1, Math.round(sprite.furniBase.getLogicDimension(0) || 1));
                    const itemLength = Math.max(1, Math.round(sprite.furniBase.getLogicDimension(1) || 1));
                    const isLengthOnX = Math.floor(direction / 2) % 2 === 0;
                    const footprintX = isLengthOnX ? itemLength : itemWidth;
                    const footprintY = isLengthOnX ? itemWidth : itemLength;
                    const mapWidth = room.roomLayout.getMapSizeX();
                    const mapHeight = room.roomLayout.getMapSizeY();
                    const maxX = Math.max(0, mapWidth - footprintX);
                    const maxY = Math.max(0, mapHeight - footprintY);
                    let x = Math.max(0, Math.min(maxX, Math.floor((mapWidth - footprintX) / 2)));
                    let y = Math.max(0, Math.min(maxY, Math.floor((mapHeight - footprintY) / 2)));
                    let bestDistance = Infinity;

                    // Prefer a complete footprint on walkable room tiles; choose the valid origin
                    // whose footprint center is closest to the room center.
                    for (let candidateX = 0; candidateX <= maxX; candidateX++) {
                        for (let candidateY = 0; candidateY <= maxY; candidateY++) {
                            let fits = true;
                            for (let dx = 0; dx < footprintX && fits; dx++) {
                                for (let dy = 0; dy < footprintY; dy++) {
                                    const candidateTile = room.roomLayout.getFloorPlane().getTilebyPosition(
                                        new Point(candidateX + dx, candidateY + dy)
                                    );
                                    if (!candidateTile || candidateTile.type === TileType.Hole) {
                                        fits = false;
                                        break;
                                    }
                                }
                            }

                            if (!fits) continue;

                            const centerX = candidateX + footprintX / 2;
                            const centerY = candidateY + footprintY / 2;
                            const distance = Math.pow(centerX - mapWidth / 2, 2) +
                                Math.pow(centerY - mapHeight / 2, 2);
                            if (distance < bestDistance) {
                                bestDistance = distance;
                                x = candidateX;
                                y = candidateY;
                            }
                        }
                    }

                    const fitScale = Math.min(1, mapWidth / footprintX, mapHeight / footprintY);
                    if (fitScale < 1) sprite.container.scale.set(fitScale);
                    const tile = room.roomLayout.getFloorPlane().getTilebyPosition(new Point(x, y));
                    const z = tile?.position.z ?? 1;
                    sprite.container.position.set(
                        ((y - x) * MapData.tileWidth) / 2 + MapData.tileWidth / 2,
                        ((x + y) * MapData.tileHeight) / 2 + MapData.tileHeight / 2 -
                            FurniData.FURNI_TOP_OFFSET - (Math.max(z, 1) - 1) * MapData.thickSpace * MapData.stairSteps
                    );
                    const itemHeight = sprite.furniBase.getLogicDimension(2);
                    const imageHeight = sprite.container.getLocalBounds().height;
                    const footprintHeight = (itemWidth + itemLength) * MapData.tileHeight / 2;
                    const isFlatFloorItem = itemHeight <= 0.01 && imageHeight > 0 &&
                        imageHeight <= footprintHeight + 16;
                    const compareY = Math.trunc(itemHeight / 100) / 10;
                    sprite.container.zIndex = RoomVisualization.calculateZIndex(
                        new Point3d(x, y + compareY, z),
                        isFlatFloorItem ? RoomPriority.FLOOR_ITEM : RoomPriority.ROOM_ITEM
                    );
                }

                roomContainer.addChild(sprite.container);
                roomContainer.sortChildren();
                const itemBounds = sprite.container.getLocalBounds();
                focus = new Point(
                    sprite.container.x + itemBounds.x + itemBounds.width / 2,
                    sprite.container.y + itemBounds.y + itemBounds.height / 2
                );
            }

            const roomBounds = roomContainer.getLocalBounds();
            const background = new Graphics();
            background.beginFill(0x000000);
            background.drawRect(roomBounds.x - 12, roomBounds.y - 12, roomBounds.width + 24, roomBounds.height + 24);
            background.endFill();

            const scene = new Container();
            scene.addChild(background, roomContainer);
            const sceneBounds = scene.getLocalBounds();
            let imageFocus = focus;
            if (!imageFocus) {
                const door = room.roomLayout.getDoorPosition();
                const doorTile = room.roomLayout.getFloorPlane().getTilebyPosition(door);
                imageFocus = doorTile?.visualization
                    ? new Point(
                        doorTile.visualization.offsetX + MapData.tileWidth / 2,
                        // The door opening is centered on the tile's upper edge, not on its floor face.
                        doorTile.visualization.offsetY
                    )
                    : new Point(
                        roomBounds.x + roomBounds.width / 2,
                        roomBounds.y + roomBounds.height / 2
                    );
            }

            // the still image first (state 0): shown at once, the animation comes when it's drawn
            if (animatedSprite) {
                animatedSprite.setAnimation(0);
                animatedSprite.setFrame(0);
            }
            const image = await UiUtils.generateBase64FromObject(scene);
            const still = {
                image,
                width: Math.ceil(sceneBounds.width),
                height: Math.ceil(sceneBounds.height),
                focusX: imageFocus.x - sceneBounds.x,
                focusY: imageFocus.y - sceneBounds.y,
            };
            onStillImage?.(still);

            const frames = animatedSprite ? this.getAnimationTimeline(animatedSprite.furniBase) : [];
            const previewFrames: string[] = [];
            const frameDurations: number[] = [];
            if (animatedSprite && frames.length > 1) {
                // a drawing is slow: the ticks that show the same frames of the layers (a frame lasts some ticks,
                // a state is looped) are drawn once
                const base = animatedSprite.furniBase;
                const direction = base.getValidDirection((animatedSprite as any).direction ?? 0);
                const layerCount = base.getLayerCount();
                const drawn = new Map<string, string>([[this.frameKey(base, direction, layerCount, 0, 0), image]]);

                for (const frame of frames) {
                    if (isCancelled?.()) {
                        previewFrames.length = 0;
                        break;
                    }

                    const key = this.frameKey(base, direction, layerCount, frame.animation, frame.tick);
                    let frameImage = drawn.get(key);
                    if (!frameImage) {
                        animatedSprite.setAnimation(frame.animation);
                        animatedSprite.setFrame(frame.tick);
                        frameImage = await UiUtils.generateBase64FromObject(scene);
                        drawn.set(key, frameImage);
                    }

                    previewFrames.push(frameImage);
                    frameDurations.push(frame.ticks * 1000 / FurniImager.FPS);
                }

                animatedSprite.setAnimation(0);
                animatedSprite.setFrame(0);
            }
            scene.removeChild(roomContainer);
            scene.destroy({children: true});

            return {
                ...still,
                frames: previewFrames.length > 1 ? previewFrames : undefined,
                frameDurations: previewFrames.length > 1 ? frameDurations : undefined,
            };
        } finally {
            room.dispose();
        }
    }

    /**
     * The frames of the preview: each declared animation state (as a click in the room changes it), shown at the
     * speed of the room (a tick every 1000 / FPS ms, as ItemLogicMultiState) and for MIN_STATE_TICKS at least
     * (its animation looped), else a state of a tick (e.g. the lamp on) would blink by.
     * `ticks`: how long the frame stays. A long animation keeps one tick out of a few (MAX_PREVIEW_FRAMES).
     */
    private static getAnimationTimeline(base: {data?: any; getAnimations(): string[]}): {animation: number; tick: number; ticks: number}[] {
        const animationIds = base.getAnimations()
            .map(Number)
            .filter(Number.isFinite)
            .sort((a, b) => a - b);
        if (!animationIds.length) return [];
        if (!animationIds.includes(0)) animationIds.unshift(0);

        const animations = base.data?.visualization?.animations ?? {};
        const durations = animationIds.map(animation => {
            const layers = Object.values(animations[String(animation)]?.layers ?? {}) as any[];
            let duration = 1;
            for (const layer of layers) {
                for (const sequence of Object.values(layer.sequences ?? {}) as any[]) {
                    const frames = Array.isArray(sequence) ? sequence : Object.values(sequence ?? {});
                    const sequenceDuration = frames.reduce((sum: number, frame: any) => {
                        const repeats = Number(frame?.repeats);
                        return sum + (Number.isFinite(repeats) && repeats > 0 ? repeats : 1);
                    }, 0);
                    duration = Math.max(duration, sequenceDuration);
                }
            }
            return {animation, duration};
        });

        // the states, looped to last MIN_STATE_TICKS at least (whole loops)
        const states = durations.map(({animation, duration}) => ({
            animation,
            duration,
            playTicks: Math.ceil(Math.max(duration, FurniPreview.MIN_STATE_TICKS) / duration) * duration,
        }));

        // a still state is one frame: the images go to the animated ones
        const animatedTicks = states.reduce((sum, state) => sum + (state.duration > 1 ? state.duration : 0), 0);
        const stride = Math.max(1, Math.ceil(animatedTicks / FurniPreview.MAX_PREVIEW_FRAMES));

        const timeline: {animation: number; tick: number; ticks: number}[] = [];
        for (const {animation, duration, playTicks} of states) {
            if (duration === 1) {
                timeline.push({animation, tick: 0, ticks: playTicks});
                continue;
            }

            for (let tick = 0; tick < playTicks; tick += stride) {
                timeline.push({animation, tick: tick % duration, ticks: Math.min(stride, playTicks - tick)});
            }
        }
        return timeline;
    }

    /** What a tick shows: the frame of each layer in the animation. */
    private static frameKey(
        base: {getFrameFrom(direction: number, animation: number, layer: number, tick: number): number},
        direction: number,
        layerCount: number,
        animation: number,
        tick: number,
    ): string {
        const layerFrames: number[] = [];
        for (let layer = 0; layer < layerCount; layer++) layerFrames.push(base.getFrameFrom(direction, animation, layer, tick));

        return `${animation}:${layerFrames.join(',')}`;
    }

    private static readonly MAX_PREVIEW_FRAMES = 24;
    /** Each state of the preview stays 2 s at least. */
    private static readonly MIN_STATE_TICKS = 48;
}
