import {ItemType} from '../../../core/room/object/items/ItemType';
import {RoomLayout} from '../RoomLayout';
import {Engine} from '../../../Engine';
import {Sprite, Texture} from 'pixi.js';
import type {DisplayObject, FederatedPointerEvent, Renderer} from 'pixi.js';
import type {Tile} from '../objects/map/Tile';
import type {Entity} from '../../../core/room/object/entities/Entity';
import { WallItem } from '../objects/items/WallItem';
import { WallType } from '../objects/map/WallTypeEnum';
import { RoomPriority } from '../visualization/RoomPriority';
import { RoomVisualization } from '../visualization/RoomVisualization';
import { MapData } from '../objects/map/MapData';
import { OutgoingPacket } from '../../../networking/packets/outgoing/OutgoingPacket';
import {Viewport} from 'pixi-viewport';
import {RenderingUtils} from '../../../utils/RenderingUtils';
import {EventManager} from '../../../core/events/EventManager';
import {UIEvents} from '../../events/ui/UIEvents';
import {RoomChatData} from '../../events/ui/data/room/RoomChatData';
import {Point} from '../../../utils/point/Point';
import { Disposable } from '../../../core/room/Disposable';
import {AvatarHoverData} from '../../events/ui/data/avatar/AvatarHoverData';

export class RoomLogic implements Disposable {
    private room: RoomLayout;
    private canvasFloorHit: HTMLCanvasElement;
    private canvasWallHit: HTMLCanvasElement;
	private lastCameraPosition: Point;
    private hoveredTile: Tile | null = null;

    /** How often (ms) the avatar under the mouse is looked for again, also with the mouse still (avatars walk). */
    private static readonly HOVER_CHECK_INTERVAL = 100;
    /** The mouse on the canvas (global coordinates), null out of it. */
    private pointerGlobal: {x: number; y: number} | null = null;
    private hoveredHumanId: string | null = null;
    private nextHoverCheck = 0;

    constructor(room: RoomLayout) {
        this.room = room;
        this.canvasFloorHit = this.room.createOrGetRoomCanvas('floorHit');

        if (Engine.getInstance().config.debugRoomClick)
            this.room.visualization.Container.addChild(
                Sprite.from(
                    Texture.from(
                        RenderingUtils.convertCanvasToImage(this.canvasFloorHit)
                    )
                )
            );

        this.canvasWallHit = this.room.createOrGetRoomCanvas('wallHit');
    }

    private readonly keyDownListener = this.onKeyDown.bind(this);

    /** The mouse left the canvas (e.g. it's on a window of the UI): no avatar under it. */
    private readonly canvasLeaveListener = () => {
        this.pointerGlobal = null;
        this.setHoveredHuman(null);
    };

	dispose(): void {
        window.removeEventListener('keydown', this.keyDownListener);
        Engine.getInstance().application?.view?.removeEventListener?.('pointerleave', this.canvasLeaveListener);
        this.pointerGlobal = null;
        this.setHoveredHuman(null);
    }

    /**
     * The next mouse move will hover the tile under the mouse again, even if it didn't change.
     */
    resetHoveredTile(): void {
        this.hoveredTile = null;
    }

    registerEvents(): void {
        const roomVisualization = this.room.visualization

        // The tile under the mouse is calculated from the floor geometry (see getTileAtGlobalPoint),
        // not from the object hit by the mouse: furni sprites are hit on their whole rectangle
        // (transparent parts included) and they used to hide the tiles behind them.
        roomVisualization.Container.on(
            'globalpointermove',
            this.onPointerMove.bind(this)
        );
        roomVisualization.Container.on(
            'pointerdown',
            this.onMouseClick.bind(this)
        );
        roomVisualization.Container.on(
            'pointerleave',
            this.onMouseOut.bind(this)
        );

        window.removeEventListener('keydown', this.keyDownListener);
        window.addEventListener('keydown', this.keyDownListener);

        const canvas = Engine.getInstance().application.view;
        canvas.removeEventListener('pointerleave', this.canvasLeaveListener);
        canvas.addEventListener('pointerleave', this.canvasLeaveListener);

        Engine.getInstance().application.viewport.on(
            'moved',
            this.onCameraMove.bind(this)
        );

        // the clicks out of the room (on nothing): the room container gets only the clicks on what it draws
        Engine.getInstance().application.viewport.on(
            'pointerdown',
            this.onViewportPointerDown.bind(this)
        );

        this.room.getFloorPlane().logic?.registerEvents();
        this.room.getWallPlane().logic?.registerEvents();
    }

    tick(delta: number): void {
        this.room.getWallPlane().logic?.tick(delta);
        this.room.getFloorPlane().logic?.tick(delta);

        // the floor and the walls drawn again in their textures if they changed
        this.room.visualization.updateBakedPlanes();

        this.updateHoveredHuman();
    }

    /**
     * The avatar under the mouse, for the tooltip with its name. It's found with a hit test of the point and not
     * with pointerover/pointerout on the avatar: its container is made again at every frame of its animation
     * (walking, dancing...), so those events were lost and the name stayed or never appeared. It's checked also
     * with the mouse still: an avatar can walk under it or away from it.
     */
    private updateHoveredHuman(): void {
        const now = performance.now();
        if (now < this.nextHoverCheck) return;

        this.nextHoverCheck = now + RoomLogic.HOVER_CHECK_INTERVAL;
        this.setHoveredHuman(this.findHumanAt(this.pointerGlobal));
    }

    private findHumanAt(point: {x: number; y: number} | null): Entity | null {
        if (!point) return null;

        const currentRoom = Engine.getInstance().roomService?.currentRoom;
        if (currentRoom?.roomLayout !== this.room) return null;

        const repository = currentRoom.roomEntityRepository;
        // while placing a furni the mouse is for the furni
        if (repository.isEntityRolling()) return null;

        const renderer = Engine.getInstance().application?.renderer as unknown as Renderer | undefined;
        // the same hit test of the clicks: the furni in front of an avatar hide it
        const hit = renderer?.events?.rootBoundary.hitTest(point.x, point.y);
        if (!hit) return null;

        const humans = new Map<DisplayObject, Entity>();
        repository.getAll().forEach((entity: Entity) => {
            const container = entity.visualization?.container;
            // structural check: Human can't be imported here without an import cycle
            if ('figure' in entity && container && !container.destroyed) humans.set(container, entity);
        });

        for (let object: DisplayObject | null = hit; object; object = object.parent) {
            const human = humans.get(object);
            if (human) return human;
            if (object === this.room.visualization.container) break;
        }

        return null;
    }

    private setHoveredHuman(entity: Entity | null): void {
        const id = entity?.id ?? null;
        if (id === this.hoveredHumanId) return;

        this.hoveredHumanId = id;
        EventManager.emit<AvatarHoverData>(UIEvents.AVATAR_HOVER, entity ? {id: entity.id, name: entity.name} : null);
    }

    getCanvasFloorHit(): HTMLCanvasElement {
        return this.canvasFloorHit;
    }

    getCanvasWallHit(): HTMLCanvasElement {
        return this.canvasWallHit;
    }

    /**
     * A click where the room draws nothing (the empty space around it, or a transparent pixel of the icon of the
     * furni that is being placed): the room container doesn't get it, the viewport does. As a click out of the
     * floor (onMouseClick) it cancels the placement: a floor furni shown as its icon, or a wall furni out of a wall.
     * The clicks on the room also arrive here (after onMouseClick): on the floor/walls nothing changes.
     */
    private onViewportPointerDown(e: FederatedPointerEvent) {
        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;
        const rolling = repository?.rollingEntity;
        if (!rolling) return;

        const visualization = this.room.visualization;

        if (rolling instanceof WallItem) {
            if (!visualization.getWallAtGlobalPoint(e.global)) repository.cancelRollingEntity();
            return;
        }

        if (repository.isRollingIcon() && !visualization.getTileAtGlobalPoint(e.global)) {
            repository.cancelRollingEntity();
        }
    }

    private onCameraMove(e: any) {
        const screen: Point = e.screen
        const viewport: Viewport = e.viewport

        EventManager.emit<RoomChatData>(UIEvents.ROOM_UPDATE_CHAT, {
            x: viewport.x,
            y: viewport.y,
        });

        this.lastCameraPosition =
            Engine.getInstance().roomService.currentRoom.roomLayout.getOffset(
                viewport.x,
                viewport.y,
                0
            );
    }

    private onPointerMove(e: FederatedPointerEvent) {
        // the avatar under the mouse is looked for at the next tick
        this.pointerGlobal = {x: e.global.x, y: e.global.y};
        this.nextHoverCheck = 0;

        const rolling = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository?.rollingEntity;
        if (rolling instanceof WallItem) {
            const visualization = this.room.visualization;
            const wall = visualization.getWallAtGlobalPoint(e.global);
            const container = rolling.visualization?.container;

            if (container) {
                container.visible = !!wall;
                if (wall) {
                    const local = this.room.visualization.container.toLocal(e.global);
                    rolling.previewOffset = {x: local.x, y: local.y};
                    const wallLocalX = Math.abs(local.x - wall.visualization.offsetX);
                    const wallLocalY = wall.visualization.offsetY + MapData.wallHeight + 120 + wallLocalX / 2 + wall.position.z * MapData.thickSpace * MapData.stairSteps - local.y;
                    rolling.setPlacement(wall, wallLocalX, wallLocalY);
                    // Wall segments on opposite sides use the two canonical
                    // Habbo wall directions (2 and 4).
                    const wallDirection = wall.type === WallType.Left || wall.type === WallType.DoorLeft ? 2 : 4;
                    if (rolling.visualization.direction !== wallDirection) {
                        rolling.visualization.updateRotation(wallDirection);
                    }
                    rolling.visualization.updatePosition();
                    container.zIndex = RoomVisualization.calculateZIndex(
                        wall.position,
                        RoomPriority.WALL_ITEM
                    );
                    // Keep the placement ghost translucent while it is attached
                    // to the wall, like the Habbo placement preview.
                    container.alpha = 0.55;
                }
            }
            return;
        }

        const tile = this.room.visualization.getTileAtGlobalPoint(e.global);
        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;

        if (!tile) {
            this.onMouseOut();

            // out of the floor the furni that is being placed is shown as its icon (as in Habbo)
            repository?.showRollingEntityAsIcon();
        } else if (tile !== this.hoveredTile) {
            this.hoveredTile = tile;

            // moves the pointer (and the furni that is being moved, if any) on the tile:
            // where the furni doesn't fit with any rotation it becomes its icon
            tile.logic?.onHover();
        }

        // the icon follows the mouse, also inside the same tile
        if (repository?.isRollingIcon()) {
            const local = this.room.visualization.container.toLocal(e.global);
            repository.moveRollingIcon(local.x, local.y);
        }
    }

    private onMouseClick(e: FederatedPointerEvent) {
        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;

        // Wall furni are positioned against wall geometry. Never fall through to
        // the floor tile click handler while one is being placed.
        if (repository?.rollingEntity instanceof WallItem) {
            const wallItem = repository.rollingEntity;
            const wall = this.room.visualization.getWallAtGlobalPoint(e.global);
            if (!wall) {
                // A wall furni cannot be dropped on the floor: clicking anywhere
                // outside a wall cancels the inventory placement.
                repository.cancelRollingEntity();
                return;
            }

            const local = this.room.visualization.container.toLocal(e.global);
            const localX = Math.abs(local.x - wall.visualization.offsetX);
            wallItem.setPlacement(
                wall,
                localX,
                wall.visualization.offsetY + MapData.wallHeight + 120 + localX / 2 + wall.position.z * MapData.thickSpace * MapData.stairSteps - local.y
            );
            const location = wallItem.getWallLocation();
            if (location) {
                Engine.getInstance().networkingManager.packetManager.applyOut(
                    OutgoingPacket.RoomPlaceItemEvent,
                    {id: Number(wallItem.id), wallPosition: location}
                );
                // the next copy of the wall furni follows (see RoomService.continuePlacement)
                Engine.getInstance().roomService?.onInventoryItemPlaced(wallItem.name, ItemType.WALL_ITEM, null);
                repository.delete(wallItem.id);
                wallItem.visualization.container?.destroy({children: true});
                repository.rollingEntity = null;
            }
            return;
        }

        // right click while moving a furni: cancel
        if (e.button === 2 && repository?.isEntityRolling()) {
            repository?.cancelRollingEntity();
            return;
        }

        // clicking an avatar is handled by the avatar itself (look at / user preview)
        if (this.isHumanTarget(e.target as DisplayObject)) return;

        const tile = this.room.visualization.getTileAtGlobalPoint(e.global);

        // out of the floor the furni being moved is its icon: it can't be dropped there
        if (!tile && repository?.isRollingIcon()) {
            repository.cancelRollingEntity();
            return;
        }

        // walk to the tile under the mouse, even if a furni is drawn over it.
        // Clicking a furni still opens its preview (ItemLogic.onClick).
        tile?.logic?.onClick();
    }

    private isHumanTarget(target: DisplayObject | null): boolean {
        if (!target) return false;

        const entities =
            Engine.getInstance().roomService?.currentRoom?.roomEntityRepository?.getAll();

        if (!entities) return false;

        const humanContainers = new Set<DisplayObject>();

        entities.forEach((entity: Entity) => {
            // humans are the only entities with a figure (no runtime import of Human: circular imports)
            if ('figure' in entity && entity.visualization?.container) {
                humanContainers.add(entity.visualization.container);
            }
        });

        for (let node: DisplayObject | null = target; node; node = node.parent) {
            if (humanContainers.has(node)) return true;
        }

        return false;
    }

    private onKeyDown(e: KeyboardEvent) {
        const roomService = Engine.getInstance().roomService;

        // keys only for the room this logic belongs to, and not while typing (chat...)
        if (roomService?.currentRoom?.roomLayout !== this.room) return;

        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

        const repository = roomService.currentRoom.roomEntityRepository;
        if (!repository.isEntityRolling()) return;

        if (e.key === 'Escape') {
            repository.cancelRollingEntity();
        } else if (e.key === 'r' || e.key === 'R') {
            roomService.rotatePlacingItem();
        }
    }

    private onMouseOut() {
        this.hoveredTile = null;
        this.room.getPointer().logic.hidePointer();
    }
}
