import {Container} from 'pixi.js';
import {Engine} from '../../../../../Engine';
import {ItemEvents} from '../../../../../engine/events/room/objects/entities/ItemEvents';
import {Item} from '../../../../../engine/room/objects/items/Item';
import {MapData} from '../../../../../engine/room/objects/map/MapData';
import {Tile} from '../../../../../engine/room/objects/map/Tile';
import {RoomPriority} from '../../../../../engine/room/visualization/RoomPriority';
import {RoomVisualization} from '../../../../../engine/room/visualization/RoomVisualization';
import {RoomDepth} from '../../../../../engine/room/visualization/RoomDepth';
import {FurniData} from '../../../../../engine/ui/imagers/items/FurniData';
import {Point} from '../../../../../utils/point/Point';
import {Point3d} from '../../../../../utils/point/Point3d';
import {UiUtils} from '../../../../../utils/UiUtils';
import {EntityVisualization} from '../../entities/EntityVisualization';
import {MoveableVisualization} from '../../Moveable';
import {FurnidataItemType} from '../../../../../engine/ui/imagers/items/enum/FurniDataItemType';

import anime from 'animejs';
import { Furni } from '../../../../../engine/ui/imagers/items/Furni';
import { WallItem } from '../../../../../engine/room/objects/items/WallItem';

export abstract class ItemVisualization
    extends EntityVisualization
    implements MoveableVisualization
{
	protected imagePreview: string;
    protected position: Point3d;
    protected iconImage: string;
    protected isIcon = false;

    private static USE_ROTATION_ANIMATION = false;

    /** State of the furni (extraData from the server): the animation shown, 0 = default (e.g. a lamp off). */
    state = 0;

    setState(state: number): void {
        this.state = state;
        if (this.sprite) (this.sprite as Furni).setAnimation(state);

        // e.g. a floor hole furni opened/closed
        Engine.getInstance().roomService?.currentRoom?.roomEntityRepository.onFloorItemsChanged();
    }

    constructor(item: Item) {
        super(item);
        this.position = item.position;
        this.iconImage = this.generateIcon();
    }

    /** Where the icon is drawn (the mouse) while the furni being placed is shown as its icon. */
    private placementIconPosition: {x: number; y: number} | null = null;

    /** True while the furni being placed is shown as its icon: it can't go under the mouse. */
    get isPlacementIcon(): boolean {
        return !!(this.sprite as Furni | undefined)?.icon;
    }

    /**
     * As in Habbo the furni that is being placed is drawn as its icon (opaque, following the mouse)
     * where it can't go, and as the translucent furni where it fits.
     */
    setPlacementIcon(icon: boolean): void {
        const furni = this.sprite as Furni | undefined;
        if (!furni || typeof furni.setIcon !== 'function' || furni.icon === icon) return;

        furni.setIcon(icon);

        if (!icon) this.placementIconPosition = null;

        if (furni.container) {
            furni.container.alpha = (icon ? FurniData.DEFAULT_ALPHA : FurniData.LOADING_ALPHA) / 255;
        }
    }

    /** The icon of the furni being placed follows the mouse (x, y in the room container). */
    movePlacementIcon(x: number, y: number): void {
        if (!this.isPlacementIcon) return;

        this.placementIconPosition = {x, y};

        if (this.container) this.container.visible = true;

        this.updatePosition();
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
            const furni = this.sprite as Furni;
            // same conversion used in render(): the furni may not have all the 8 directions
            furni.setDirection(furni.furniBase?.getValidDirection(rotation) ?? rotation);
            this.sprite.update(true);
        }

        // the footprint changed
        Engine.getInstance().roomService?.currentRoom?.roomEntityRepository.onFloorItemsChanged();
    }

    updatePosition(): void {
        super.updatePosition();

        if (!this.container) return;

        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;

        // the furni that is being moved must not catch the click that places it
        const isBeingMoved =
            (this.entity as Item).isInventoryGhost || repository?.rollingEntity === this.entity;
        this.container.eventMode = isBeingMoved ? 'none' : 'dynamic';

        // the icon is on the mouse, over everything (the furni keeps its last valid position)
        if (this.placementIconPosition && this.isPlacementIcon) {
            this.container.x = this.placementIconPosition.x;
            this.container.y = this.placementIconPosition.y;
            this.container.zIndex = Number.MAX_SAFE_INTEGER;
        }

        this.syncFrontContainer();

        repository?.onFloorItemsChanged();
    }

    /**
     * The layers in front of the avatars that are on the furni go in the front container, drawn just above
     * those avatars (as Nitro, that sorts every sprite by its depth): e.g. the front of hcamme over an avatar
     * sitting in it, while its back stays behind. The depth of a layer is the furni origin plus its z offset.
     *
     * @param humans depth and zIndex of the avatars on the footprint of the furni.
     */
    updateFrontLayers(humans: {depth: number; zIndex: number}[]): void {
        const furni = this.sprite as Furni | undefined;
        if (!furni || typeof furni.getLayerDepths !== 'function') return;

        const front = new Set<number>();
        let frontZIndex = -Infinity;

        if (humans.length > 0 && !this.isPlacementIcon) {
            const origin = this.entity.position;
            // the Z 0 of the items saved before the heights is the floor (see FloorItem.calculateOffsetY)
            const originDepth = RoomDepth.of(origin.x, origin.y, Math.max(origin.z, 1));

            for (const [layer, offset] of furni.getLayerDepths()) {
                for (const human of humans) {
                    if (originDepth + offset >= human.depth) continue;

                    front.add(layer);
                    frontZIndex = Math.max(frontZIndex, human.zIndex);
                }
            }
        }

        furni.setFrontLayers(front);

        // just above the avatars it covers, below anything in front of them (the zIndex are integers)
        if (front.size > 0) furni.frontContainer.zIndex = frontZIndex + 0.5;

        this.syncFrontContainer();
    }

    /** The front container follows the furni container: same parent, position, visibility and alpha. */
    private syncFrontContainer(): void {
        const front = (this.sprite as Furni | undefined)?.frontContainer;
        if (!front || front.destroyed || !this.container || this.container.destroyed) return;

        const parent = this.container.parent;
        if (parent && front.parent !== parent) parent.addChild(front);

        front.x = this.container.x;
        front.y = this.container.y;
        front.visible = this.container.visible && front.children.length > 0;
        front.alpha = this.container.alpha;

        if (this.linkedFrontContainer !== front) {
            this.linkedFrontContainer = front;

            // the layers in front are still the furni for the mouse
            const container = this.container;
            front.eventMode = 'dynamic';
            front.cursor = 'pointer';
            front.on('pointerdown', event => container.emit('pointerdown', event));
            front.on('pointerover', event => container.emit('pointerover', event));

            container.once('destroyed', () => {
                if (!front.destroyed) front.destroy({children: true});
            });
        }
    }

    private linkedFrontContainer: Container | null = null;

    async render(): Promise<void> {

        if (this.container) this.container.removeChildren();

        // a new sprite is created: the layers in front of the old one leave the room
        const oldFront = (this.sprite as Furni | undefined)?.frontContainer;
        if (oldFront && !oldFront.destroyed) {
            oldFront.parent?.removeChild(oldFront);
            oldFront.removeChildren();
        }

        try {
            const sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniSprite(
                this.entity instanceof WallItem ? FurnidataItemType.WallItem : FurnidataItemType.FloorItem,
                this.entity.name
            );

            await sprite.init();
            const dir = sprite.furniBase.getValidDirection(this.direction);
            sprite.setDirection(dir);
            sprite.setAnimation(this.state);
            sprite.update(true);
            this.sprite = sprite;
        } catch (e) {
            const sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniPlaceholder(
                this.entity instanceof WallItem ? FurnidataItemType.WallItem : FurnidataItemType.FloorItem,
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
        return (this.entity as Item).calculateOffsetX();
    }

    calculateOffsetY(): number {
        return (this.entity as Item).calculateOffsetY();
    } 

    getZIndex(zIndex = 1): number {
        if (this.entity instanceof WallItem) {
            const wallData = this.entity.wallData;
            return RoomVisualization.calculateZIndex(
                new Point3d(wallData.width, wallData.height, 0),
                RoomPriority.WALL_ITEM
            );
        }

        const compareY =
            Math.trunc((this.entity as Item).base.getLogicDimension(2) / 100) /
            10;
        return RoomVisualization.calculateZIndex(
            new Point3d(
                this.entity.position.x,
                this.entity.position.y + compareY,
                this.entity.position.z
            ),
            this.isFlatFloorItem() ? RoomPriority.FLOOR_ITEM : RoomPriority.ROOM_ITEM
        );
    }

    /** Margin over the tiles of a flat furni for its thickness (e.g. the edge of a rug). */
    private static readonly FLAT_ITEM_MARGIN = 16;

    /** Part of the width of its tiles a flat furni covers at least (a rug covers them, the edges may be thinner). */
    private static readonly FLAT_ITEM_MIN_WIDTH = 0.75;

    /**
     * A furni that is part of the floor (a rug, val11_floor, party_floor): no height in its logic and an image
     * not taller than its tiles, as wide as its tiles. It's drawn with the floor, under the tile pointer (as Habbo).
     * The height alone is not enough: e.g. party_tube_bubble has no height but it's a tall tube; a football has no
     * height and a small image, but it's on the floor, not part of it (the pointer was drawn over it).
     */
    private isFlatFloorItem(): boolean {
        const base = (this.entity as Item).base;
        const container = (this.sprite as Furni | undefined)?.container;
        if (!base || !container || base.getLogicDimension(2) > 0.01) return false;

        const bounds = container.getLocalBounds();
        if (bounds.height <= 0) return false;

        // the rhombus of its tiles: half a tile for each tile along x and y
        const tiles = base.getLogicDimension(0) + base.getLogicDimension(1);
        const tilesHeight = tiles * MapData.tileHeight / 2;
        const tilesWidth = tiles * MapData.tileWidth / 2;

        return bounds.height <= tilesHeight + ItemVisualization.FLAT_ITEM_MARGIN
            && bounds.width >= tilesWidth * ItemVisualization.FLAT_ITEM_MIN_WIDTH;
    }

    public getimagePreview(): string {
        return this.imagePreview
    }

    private generateIcon(): string {
        return '';
    }
}
