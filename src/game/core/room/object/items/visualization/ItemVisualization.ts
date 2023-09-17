import {Container} from 'pixi.js';
import {Engine} from '../../../../../Engine';
import {ItemEvents} from '../../../../../engine/events/room/objects/entities/ItemEvents';
import {Item} from '../../../../../engine/room/objects/items/Item';
import {MapData} from '../../../../../engine/room/objects/map/MapData';
import {Tile} from '../../../../../engine/room/objects/map/Tile';
import {RoomPriority} from '../../../../../engine/room/visualization/RoomPriority';
import {RoomVisualization} from '../../../../../engine/room/visualization/RoomVisualization';
import {FurniData} from '../../../../../engine/ui/imagers/items/FurniData';
import {Point} from '../../../../../utils/point/Point';
import {Point3d} from '../../../../../utils/point/Point3d';
import {UiUtils} from '../../../../../utils/UiUtils';
import {EntityVisualization} from '../../entities/EntityVisualization';
import {MoveableVisualization} from '../../IMoveable';
import {FurnidataItemType} from '../../../../../engine/ui/imagers/items/enum/FurniDataItemType';

import anime from 'animejs';

export abstract class ItemVisualization
    extends EntityVisualization
    implements MoveableVisualization
{
    protected position: Point3d;
    protected iconImage: string;
    imagePreview: string;
    protected isIcon = false;

    private static USE_ROTATION_ANIMATION = false;

    constructor(item: Item) {
        super(item);
        this.position = item.position;
        this.iconImage = this.generateIcon();
    }

    nextFrame(): void {}

    draw(): void {
        if (Engine.getInstance().roomService?.CurrentRoom) {
            const temp: Container = this.sprite.container;

            if (this.needsUpdate) this.sprite.reset();

            this.sprite.update(true);

            this.container = temp;

            this.container.eventMode = 'dynamic';

            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(
                this.container
            );
            this.updatePosition();
        }
    }

    reset() {
        this.entity.visualization.container = this.container;
        this.needsUpdate = false;
        this.isIcon = false;
    }

    private async generateImagePreview() {
        return this.entity
            ? await UiUtils.generateBase64FromObject(this.container)
            : null;
    }

    private generateIcon(): string {
        return '';
    }

    rotate(): void {
        this.render();

        const tempY = this.container.y;

        if (!ItemVisualization.USE_ROTATION_ANIMATION) return;

        anime({
            targets: this.container.position,
            x: this.container.x,
            y: this.container.y - 20,
        });

        setTimeout(() => {
            anime({
                targets: this.container.position,
                x: this.container.x,
                y: this.container.y + 10,
            });
        }, 250);
    }

    updateRotation(rotation: number): void {
        const direction = rotation;

        if (direction == this.direction) {
            return;
        }
        this.direction = rotation;

        this.rotate();
    }

    async render(): Promise<void> {
        if (this.container) this.container.removeChildren();

        try {
            const sprite =
                await Engine.getInstance().userInterfaceManager.furniImager.loadFurniSprite(
                    FurnidataItemType.FloorItem,
                    this.entity.name
                );

            await sprite.init();

            const dir = sprite.furniBase.getValidDirection(this.direction);

            sprite.setDirection(dir);

            sprite.update(true);

            this.sprite = sprite;
        } catch (e) {
            const sprite =
                await Engine.getInstance().userInterfaceManager.furniImager.loadFurniPlaceholder(
                    FurnidataItemType.FloorItem,
                    this.entity.name
                );

            await sprite.init();

            sprite.update(true);

            this.sprite = sprite;
        }

        if (!this._entity) return;

        const spriteZIndex = (this._entity as Item).base.getLogicDimension(2);

        if (!this.sprite.container) return;

        this.sprite.container.zIndex = this.getZIndex(spriteZIndex);

        this.sprite.container.eventMode = 'dynamic';

        this.container = this.sprite.container;
        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(
                this.sprite.container
            );
            this.updatePosition();
        }
        this.entity.logic?.registerEvents();
        this.entity.logic?.events.emit(ItemEvents.ITEM_LOADED);
    }

    calculateOffsetX(): number {
        const currentRoom = Engine.getInstance().roomService?.CurrentRoom;
        const tile: Tile = currentRoom.roomLayout
            .getFloorPlane()
            .getTilebyPosition(
                new Point(
                    Math.round(this.position.x),
                    Math.round(this.position.y)
                )
            );

        return (
            ((tile!.position.y - tile!.position.x) *
                MapData.tileWidth) /
                2 +
            MapData.tileWidth / 2 +
            1
        );
    }

    calculateOffsetY(): number {
        const currentRoom = Engine.getInstance().roomService?.CurrentRoom;
        const tile: Tile = currentRoom.roomLayout
            .getFloorPlane()
            .getTilebyPosition(
                new Point(
                    Math.round(this.position.x),
                    Math.round(this.position.y)
                )
            );

        const offsetFloor =
            tile!.position.z > 0
                ? -MapData.thickSpace *
                  MapData.stepHeight *
                  tile!.position.z
                : -FurniData.FURNI_TOP_OFFSET;

        return (
            ((tile!.position.y + tile!.position.x) *
                MapData.tileHeight) /
                2 +
            MapData.tileHeight / 2 +
            offsetFloor +
            2
        );
    }

    getZIndex(zIndex = 1): number {
        const compareY =
            Math.trunc((this._entity as Item).base.getLogicDimension(2) / 100) /
            10;
        return RoomVisualization.calculateZIndex(
            new Point3d(
                this.entity.position.x,
                this.entity.position.y + compareY,
                this.entity.position.z
            ),
            RoomPriority.ROOM_ITEM
        );
    }
}
