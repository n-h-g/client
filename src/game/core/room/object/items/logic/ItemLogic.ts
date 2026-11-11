import {ItemType} from '../ItemType';
import {Engine} from '../../../../../Engine';
import {EntityEvents} from '../../../../../engine/events/room/objects/entities/EntityEvents';
import {ItemEvents} from '../../../../../engine/events/room/objects/entities/ItemEvents';
import {Item} from '../../../../../engine/room/objects/items/Item';
import {FurniData} from '../../../../../engine/ui/imagers/items/FurniData';
import {FurnidataItemType} from '../../../../../engine/ui/imagers/items/enum/FurniDataItemType';
import {FurniPreview} from '../../../../../engine/ui/imagers/items/utils/FurniPreview';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {MoveableLogic} from '../../Moveable';
import {EntityLogic} from '../../entities/EntityLogic';
import {Point3d} from '../../../../../utils/point/Point3d';

export abstract class ItemLogic extends EntityLogic implements MoveableLogic {
    roll = false;

    constructor(item: Item) {
        super(item);
    }

    protected registerLogicEvents(): void {
        super.registerLogicEvents();

        this.events.on(ItemEvents.ITEM_LOADED, () => this.onLoad());
        this.events.on(EntityEvents.POSITION_CHANGED, () =>
            this.onPositionChanged()
        );
        this.events.on(EntityEvents.START_ROLL, () =>
            this.toggleMovement(true)
        );
        this.events.on(EntityEvents.STOP_ROLL, () => this.stopRolling());
        this.events.on(EntityEvents.CANCEL_ROLL, (startPosition: Point3d | null) =>
            this.cancelRolling(startPosition)
        );
    }

    onLoad() {}

    /**
     * New data of the furni from the server (Item.extraData): usually the state, already shown; some furni read
     * other data (e.g. the light of a room dimmer).
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onExtraData(data: number | string | null): void {}

    onHover(): void {
        super.onHover();
    }

    onPositionChanged(): void {}

    /*placeItem() {
        Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.RoomPickupItemEvent,
            {
                id: this.entity.id,
            }
        );
        Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.RoomPlaceItemEvent,
            {
                id: this.entity.id,
                x: this.entity.position.x,
                y: this.entity.position.y,
                z: this.entity.position.z,
            }
        );

        this.toggleMovement(false);
    }*/

    onClick(): void {
        // Only the preview: the movement goes to the tile under the mouse (RoomLogic.onMouseClick),
        // not to the furni origin tile (which can be a blocked tile, e.g. a table).
        this.togglePreview();
    }

    /** The color of the panel of the card (PreviewBoxGUI): behind the layers with ink ADD (see FurniPreview). */
    private static readonly PREVIEW_BACKGROUND = 0x2e2e2c;

    /**
     * The card of a furni shows it in its first state (as the catalogue), not as it is now in the room: e.g. an
     * effect furni while it's exploding, a lamp switched off. As it is if it can't be drawn.
     */
    protected async getPreviewImage(): Promise<string> {
        try {
            // structural check (a wall furni has its placement on the wall): importing WallItem here is a cycle
            const type = 'placementWall' in this.entity ? FurnidataItemType.WallItem : FurnidataItemType.FloorItem;

            const image = await Promise.race([
                FurniPreview.render(this.entity.name, ItemLogic.PREVIEW_BACKGROUND, type),
                new Promise<null>(resolve => setTimeout(() => resolve(null), 1500)),
            ]);
            if (image) return image;
        } catch (e) {
            // not drawn: as it is in the room
        }

        return super.getPreviewImage();
    }

    toggleMovement(value: boolean): void {
        this.roll = value;
        this.entity.visualization.needsUpdate = value;
        this.entity.visualization.sprite.container.alpha =
            (value ? FurniData.LOADING_ALPHA : FurniData.DEFAULT_ALPHA) / 255;
    }

    onMove(delta: number): void {
        this.entity.visualization.move(delta * 1000);
    }

    tick(delta: number) {
        // moved by a roller
        this.entity?.visualization?.updateSlide();

        if (this.roll) {
            this.onMove(delta);
        }

        if (!this.entity) {
            return;
        }

        if (this.entity.visualization.needsUpdate)
            this.entity.visualization.draw();
    }

    stopRolling() {
        this.entity.visualization.needsUpdate = false;

        this.toggleMovement(false);

        // the furni could be still sliding towards the last hovered tile: use the tile itself
        this.entity.visualization.snapToNextPosition();

        const item = this.entity as Item;

        // - from the inventory: PlaceItem with the inventory item id
        // - already in the room: MoveItem with the room entity id (UUID)
        // The server calculates the Z (stack height) in both cases.
        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
            item.isInventoryGhost
                ? OutgoingPacket.RoomPlaceItemEvent
                : OutgoingPacket.RoomMoveItemEvent,
            {
                id: this.entity.id,
                name: this.entity.name,
                x: Math.round(this.entity.position.x),
                y: Math.round(this.entity.position.y),
                rot: this.entity.visualization.direction,
            }
        );

        this.roll = false;

        // the server sends the real furni (AddRoomEntity) and the updated inventory: then the next copy is placed
        if (item.isInventoryGhost) {
            Engine.getInstance()?.roomService?.onInventoryItemPlaced(
                this.entity.name,
                ItemType.FLOOR_ITEM,
                this.entity.visualization.direction
            );
            this.removeGhost();
        }
    }

    /**
     * Moving cancelled (ESC / right click): the preview from the inventory is removed,
     * a furni of the room goes back to its position.
     */
    cancelRolling(startPosition: Point3d | null) {
        this.toggleMovement(false);
        this.roll = false;

        if ((this.entity as Item).isInventoryGhost) {
            Engine.getInstance()?.roomService?.stopPlacementChain();
            this.removeGhost();
            return;
        }

        if (startPosition) {
            this.entity.visualization.setNextPosition(startPosition);
            this.entity.visualization.snapToNextPosition();
        }
    }

    private removeGhost() {
        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;

        repository?.delete(this.entity.id);
        this.entity.visualization.container?.destroy({children: true});
        repository?.onFloorItemsChanged();
    }
}
