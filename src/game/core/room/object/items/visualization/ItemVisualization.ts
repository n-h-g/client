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
import {MoveableVisualization} from '../../Moveable';
import {FurnidataItemType} from '../../../../../engine/ui/imagers/items/enum/FurniDataItemType';

import anime from 'animejs';
import { Furni } from '../../../../../engine/ui/imagers/items/Furni';

export abstract class ItemVisualization
    extends EntityVisualization
    implements MoveableVisualization
{
	protected imagePreview: string;
    protected position: Point3d;
    protected iconImage: string;
    protected isIcon = false;

    private static USE_ROTATION_ANIMATION = false;

    constructor(item: Item) {
        super(item);
        this.position = item.position;
        this.iconImage = this.generateIcon();
    }

    nextFrame(): void {
        if (this.sprite && typeof (this.sprite as any).nextFrame === 'function') {
            (this.sprite as Furni).nextFrame();
        }
    }


    draw(): void {
        if (Engine.getInstance().roomService?.currentRoom && this.sprite) {
        
            if (this.needsUpdate) {
                this.sprite.update(true);
                this.needsUpdate = false;
            } else {
  
                this.sprite.update(false);
            }

            const temp: Container = this.sprite.container;
            this.container = temp;
            this.container.eventMode = 'dynamic';
            this.container.interactive = true;

            const roomContainer = Engine.getInstance().roomService?.currentRoom?.roomLayout.visualization.container;
            if (roomContainer && this.container.parent !== roomContainer) {
                roomContainer.addChild(this.container);
            }
            
            this.updatePosition();
        }
    }

    reset() {
        this.entity.visualization.container = this.container;
        this.needsUpdate = false;
        this.isIcon = false;
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
        if (rotation === this.direction) return;

        this.direction = rotation;

        if (this.sprite) {
            (this.sprite as Furni).setDirection(rotation);
            this.sprite.update(true);
        }
    }
    async render(): Promise<void> {

        if (this.container) this.container.removeChildren();

        try {
            const sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniSprite(
                FurnidataItemType.FloorItem,
                this.entity.name
            );

            await sprite.init();
            const dir = sprite.furniBase.getValidDirection(this.direction);
            sprite.setDirection(dir);
            sprite.update(true);
            this.sprite = sprite;
        } catch (e) {
            const sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniPlaceholder(
                FurnidataItemType.FloorItem,
                this.entity.name
            );
            await sprite.init();
            sprite.update(true);
            this.sprite = sprite;
        }

        if (!this.entity) return;

        const spriteZIndex = (this.entity as Item).base.getLogicDimension(1);
        if (!this.sprite.container) return;

        this.sprite.container.zIndex = this.getZIndex(spriteZIndex);
        this.sprite.container.eventMode = 'dynamic';
        this.container = this.sprite.container;

        if (Engine.getInstance().roomService?.currentRoom) {
            Engine.getInstance().roomService?.currentRoom?.roomLayout.visualization.container?.addChild(
                this.sprite.container
            );
            this.updatePosition();
        }

        try {
            const imageElement = await UiUtils.generateImageFromObject(this.container);
            //console.log(imageElement)
            this.imagePreview = imageElement.src;
        } catch (error) {
        }
        // ---------------------------------------

        this.entity.logic?.registerEvents();
        this.entity.logic?.events.emit(ItemEvents.ITEM_LOADED);
    }

    calculateOffsetX(): number {
        const x = this.position.x;
        const y = this.position.y;

        const tileBaseX = ((y - x) * MapData.tileWidth) / 2;

        
        return tileBaseX + (MapData.tileWidth / 2) - 3;
    }

    calculateOffsetY(): number {
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z;

        const tileBaseY = ((y + x) * MapData.tileHeight) / 2;

        const zOffset = z * MapData.thickSpace * MapData.stairSteps;

        const offsetFloor = z > 0 ? -zOffset : -FurniData.FURNI_TOP_OFFSET;

        return tileBaseY + (MapData.tileHeight / 2) + offsetFloor;
    }   

    getZIndex(zIndex = 1): number {
        const compareY =
            Math.trunc((this.entity as Item).base.getLogicDimension(2) / 100) /
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

    public getimagePreview(): string {
        return this.imagePreview
    }

    private generateIcon(): string {
        return '';
    }
}
