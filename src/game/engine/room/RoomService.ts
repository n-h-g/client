import {Room} from './Room';
import {Point} from '../../utils/point/Point';
import {Engine} from '../../Engine';
import {EventManager} from '../../core/events/EventManager';
import {HotelViewData} from '../events/ui/data/static/HotelView';
import {RoomUIEventData} from '../events/ui/data/room/RoomUIEventData';
import {UIComponent} from '../ui/components/UIComponent';
import {IComponentShowableUI} from '../../core/ui/IComponentShowableUI';
import {UIEvents} from '../events/ui/UIEvents';
import {Service} from '../../core/Service';
import {Disposable} from '../../core/room/Disposable';
import {EnterRoomUIEventData} from '../events/ui/data/room/EnterRoomUIEventData';
import { Point3d } from '../../utils/point/Point3d';
import { FurnidataItemType } from '../ui/imagers/items/enum/FurniDataItemType';
import { FloorItem } from './objects/items/FloorItem';
import { WallItem } from './objects/items/WallItem';
import { ItemType } from '../../core/room/object/items/ItemType';
import { FurnitureWallData } from './objects/items/WallItemData';

export class RoomService
    extends Service<null, null>
    implements Disposable
{
    private wrappedCurrentRoom: Room;

    constructor() {
        super();
    }

    setRoom(
        roomName: string,
        roomModel: string,
        doorPosition: Point,
        roomId: number,
        authorName: string
    ): Room {
        Engine.getInstance()?.application.setUpViewport();
        this.wrappedCurrentRoom = new Room(
            roomName,
            roomModel,
            doorPosition,
            roomId,
            authorName
        );
        this.wrappedCurrentRoom.roomLayout.visualization.render();
        this.wrappedCurrentRoom.roomLayout.logic.registerEvents();
        Engine.getInstance()?.application?.viewport.addChild(
            this.wrappedCurrentRoom.roomLayout.visualization.container
        );
        this.toggleUI();
        return this.wrappedCurrentRoom;
    }

    getHighestZAt(x: number, y: number): number {
        const room = Engine.getInstance().roomService.currentRoom;
        if (!room) return 0;

        const tile = room.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.floor(x), Math.floor(y)));
        let highestZ = tile ? tile.position.z : 0;

        const entities = room.roomEntityRepository.getEntitiesAt(Math.floor(x), Math.floor(y));

        for (const entity of entities) {
            const entityHeight = entity.visualization.sprite.container.y
            const entityZ = entity.position.z + entityHeight;

            if (entityZ > highestZ) {
                highestZ = entityZ;
            }
        }

        return highestZ;
    }

    public async startItemPlacement(inventoryItem: any) {
        const room = this.currentRoom;
        if (!room) return;

        const isWallItem = inventoryItem.item_type === ItemType.WALL_ITEM;
        const furniType = isWallItem ? FurnidataItemType.WallItem : FurnidataItemType.FloorItem;
        const base = await Engine.getInstance().userInterfaceManager!.furniImager.loadFurniBase(
            furniType,
            inventoryItem.name 
        );

        // only one furni at a time: a placement/move already in progress is cancelled
        room.roomEntityRepository.cancelRollingEntity();

        const ghost = isWallItem
            ? new WallItem(inventoryItem.id.toString(), inventoryItem.name, base, new FurnitureWallData({
                localX: 0, localY: 0, width: 0, height: 0, y: 0, z: 0,
                direction: 2, stuffData: '', secondsToExpiration: 0, isOldFormat: false,
            }))
            : new FloorItem(inventoryItem.id.toString(), inventoryItem.name, new Point3d(0, 0, 0), base);

        ghost.isInventoryGhost = true;
        if (ghost instanceof FloorItem) ghost.visualization.direction = FloorItem.DEFAULT_PLACEMENT_ROTATION;

        room.roomEntityRepository.add(ghost.id, ghost);

        // the sprite must exist before the furni can follow the mouse
        await ghost.visualization.render();

        // the room changed or the placement was cancelled while loading
        if (this.currentRoom !== room || room.roomEntityRepository.get(ghost.id) !== ghost) return;

        // hidden until the mouse is on a tile (it would be drawn at 0,0)
        if (ghost.visualization.container) ghost.visualization.container.visible = false;

        room.roomEntityRepository.setRollingEntity(ghost);

        // the first tile hovered (even the one already under the mouse) moves the furni there
        room.roomLayout.logic.resetHoveredTile();
    }

    /**
     * Rotates the furni that is being placed from the inventory (R key).
     */
    rotatePlacingItem() {
        const repository = this.currentRoom?.roomEntityRepository;
        const ghost = repository?.rollingEntity as FloorItem | undefined;

        if (!ghost || !ghost.isInventoryGhost) return;

        // the next rotation of the furni; where it doesn't fit the furni keeps a rotation that fits
        // (the footprint changes: the furni could go on top of different furni)
        const position = ghost.position;
        const tile = this.currentRoom.roomLayout.getFloorPlane()
            .getTilebyPosition(new Point(Math.round(position.x), Math.round(position.y)));

        if (tile) repository.rotateRollingEntity(tile.position);
    }

    /**
     * Generate a square room n * n.
     * @param size the number of tiles you want to generate (n * n)
     * @returns
     */
    generateSquareRoomModel(size: number) {
        let count = 1;

        let model = '';

        const area = size * size;

        while (count <= area) {
            if (count % size == 0 && count != area) {
                model += '1/';
            } else {
                model += '1';
            }

            count++;
        }

        return model;
    }

    toggleUI() {
        if (Engine.getInstance().config.offlineMode) return;

        Engine.getInstance()
            .userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(
                UIComponent.RoomUI
            )
            .toggle();

        EventManager.emit<HotelViewData>(UIEvents.HOTEL_VIEW, {
            mode: false,
        });
        EventManager.emit<RoomUIEventData>(UIEvents.ROOM_UI, {
            enabled: true,
        });
        EventManager.emit<EnterRoomUIEventData>(UIEvents.ENTER_ROOM_INFO, {
            name: this.currentRoom.roomInfo.roomName,
            description: this.currentRoom.roomInfo.description,
            owner: this.currentRoom.roomInfo.authorName ?? '',
            haveRights: true,
        });
    }

    dispose(): void {
        if (!this.wrappedCurrentRoom) {
            return;
        }

        this.toggleUI();

        this.wrappedCurrentRoom.roomLayout.visualization.dispose();
        this.wrappedCurrentRoom = null;
    }

    tick(delta: number): void {
        this.wrappedCurrentRoom?.roomLayout.logic.tick(delta);
        this.wrappedCurrentRoom?.roomEntityRepository.tick(delta);
    }

    get currentRoom(): Room {
        return this.wrappedCurrentRoom;
    }
}
