import {Repository} from '../../core/Repository';
import {Entity} from '../../core/room/object/entities/Entity';
import {Point3d} from '../../utils/point/Point3d';
import {EntityEvents} from '../events/room/objects/entities/EntityEvents';
import {Point} from '../../utils/point/Point';
import type {Item, ItemFootprint} from './objects/items/Item';
import type {FloorItem} from './objects/items/FloorItem';
import type {FloorPlane} from './objects/map/FloorPlane';
import {TileType} from './objects/map/TileTypeEnum';
import {RoomDepth} from './visualization/RoomDepth';
import {ActionId} from '../ui/imagers/avatars/enum/actions/ActionId';

/** What the repository needs of ItemVisualization to show a floor furni as its icon while it's placed. */
type PlacementVisualization = {
    readonly isPlacementIcon: boolean;
    setPlacementIcon(icon: boolean): void;
    movePlacementIcon(x: number, y: number): void;
};

/** What the repository needs of ItemVisualization to draw the layers of a floor furni over the avatars on it. */
type FrontLayersVisualization = {
    updateFrontLayers(humans: {depth: number; zIndex: number}[]): void;
};

export class RoomEntityRepository extends Repository<string, Entity> {
    /** Logic of the furni that remove the floor under them (hole3, ...). */
    static readonly FLOOR_HOLE_LOGIC = 'furniture_floor_hole';
    /** State of a floor hole furni in which the hole is open (as in Habbo). */
    private static readonly FLOOR_HOLE_OPEN_STATE = 0;

    rollingEntity: Entity;
    /** Floor of the room, where the floor hole furni remove the tiles. */
    floorPlane: FloorPlane | null = null;
    private rollingStartPosition: Point3d | null = null;
    /** Rotation of the furni when it started moving: it gets it back if the move is cancelled. */
    private rollingStartDirection: number | null = null;
    /** Rotation chosen by the user (R key) for the furni being placed: it's used wherever it fits. */
    private rollingWantedDirection: number | null = null;

    constructor() {
        super();
    }

    public getEntityAt(x: number, y: number): Entity | undefined {
        for (const entity of this.getAll().values()) {
            if (Math.floor(entity.position.x) === Math.floor(x) &&
                Math.floor(entity.position.y) === Math.floor(y)) {
                return entity;
            }
        }
        return undefined;
    }
    
    public getEntitiesAt(x: number, y: number): Entity[] {
        return Array.from(this.getAll().values()).filter((entity: Entity) => {
            return Math.floor(entity.position.x) === Math.floor(x) &&
                Math.floor(entity.position.y) === Math.floor(y);
        });
    }

    isEntityRolling(): boolean {
        return this.rollingEntity != null ? true : false;
    }

    stopRollingEntity() {
        if (this.rollingEntity == null) return;

        // shown as its icon: it can't go there, as in Habbo the click doesn't place it
        if (this.isRollingIcon()) {
            this.cancelRollingEntity();
            return;
        }

        const entity = this.rollingEntity;
        this.rollingEntity = null;

        entity.logic.events.emit(EntityEvents.STOP_ROLL);

        // a floor hole that was being moved opens again where it was dropped
        this.onFloorItemsChanged();
    }

    /**
     * Stops moving the furni without placing it: a furni from the inventory is removed,
     * a furni of the room goes back where it was (with its rotation).
     */
    cancelRollingEntity() {
        if (this.rollingEntity == null) return;

        const entity = this.rollingEntity;
        this.rollingEntity = null;

        RoomEntityRepository.placementVisualization(entity)?.setPlacementIcon(false);

        const item = entity as unknown as Partial<Item>;
        if (!item.isInventoryGhost && this.rollingStartDirection !== null) {
            entity.visualization.updateRotation(this.rollingStartDirection);
        }

        entity.logic.events.emit(EntityEvents.CANCEL_ROLL, this.rollingStartPosition);
    }

    /**
     * The rotation the user chose for the furni that is being placed (R key): the furni gets it again
     * where it fits, elsewhere it's turned to a rotation that fits.
     */
    rotateRollingEntity(position: Point3d) {
        const entity = this.rollingEntity;
        const item = entity as unknown as Partial<FloorItem>;
        if (!entity || typeof item.getFootprintAt !== 'function') return;

        // the first rotation of the furni after the wanted one (from the last back to the first)
        this.rollingWantedDirection = this.getPlacementDirections(entity, (this.rollingWantedDirection ?? 0) + 1)[0];

        // shown as its icon away from its last tile: the new rotation is used on the next tile
        if (this.isRollingIcon()) return;

        this.updateRollingEntity(position);
    }

    /**
     * Moves the furni that is being placed on the given tile, on top of the furni already there.
     * A floor furni that doesn't fit with its rotation is turned (as in Habbo/Nitro); if no rotation
     * fits it's shown as its icon.
     */
    updateRollingEntity(position: Point3d) {
        if (this.rollingEntity == null) return;

        const entity = this.rollingEntity;
        const visualization = entity.visualization;
        const placement = RoomEntityRepository.placementVisualization(entity);

        if (placement) {
            const direction = this.findPlacementDirection(entity, position.x, position.y);

            if (direction === null) {
                placement.setPlacementIcon(true);
                return;
            }

            placement.setPlacementIcon(false);

            if (direction !== visualization.direction) visualization.updateRotation(direction);
        }

        // the furni jumps on the tile under the mouse (no sliding)
        visualization.setNextPosition(new Point3d(position.x, position.y, position.z));
        visualization.snapToNextPosition();

        visualization.setNextPosition(
            new Point3d(position.x, position.y, this.getStackHeightUnder(entity, position.z))
        );
        visualization.snapToNextPosition();

        if (visualization.container) visualization.container.visible = true;

        entity.logic.events.emit(EntityEvents.START_ROLL);
    }

    setRollingEntity(entity: Entity) {
        if (entity == null) return;

        // a furni already being moved is put back first
        if (this.rollingEntity && this.rollingEntity !== entity) this.cancelRollingEntity();

        this.rollingEntity = entity;
        this.rollingStartPosition = new Point3d(entity.position.x, entity.position.y, entity.position.z);
        this.rollingStartDirection = entity.visualization?.direction ?? null;
        this.rollingWantedDirection = entity.visualization?.direction ?? 0;

        // a floor hole that starts moving gives back its tiles (they must be valid places for it)
        this.onFloorItemsChanged();
    }

    /** True while the floor furni that is being moved is shown as its icon (it can't go under the mouse). */
    isRollingIcon(): boolean {
        return !!this.rollingEntity && !!RoomEntityRepository.placementVisualization(this.rollingEntity)?.isPlacementIcon;
    }

    /**
     * The mouse is not on the floor: the floor furni that is being moved is shown as its icon.
     */
    showRollingEntityAsIcon() {
        if (!this.rollingEntity) return;

        RoomEntityRepository.placementVisualization(this.rollingEntity)?.setPlacementIcon(true);
    }

    /**
     * The icon of the furni that is being moved follows the mouse.
     * @param x, y the mouse position in the room container.
     */
    moveRollingIcon(x: number, y: number) {
        if (!this.isRollingIcon()) return;

        RoomEntityRepository.placementVisualization(this.rollingEntity)?.movePlacementIcon(x, y);
    }

    /**
     * The rotation the furni gets with its origin on x, y: the one chosen by the user if it fits there,
     * else the first of its other rotations that fits; null if no rotation fits.
     * The rotations facing the room (2 and 4, towards the viewer) come before the ones facing the walls:
     * e.g. a sofa turned to 4 at the end of a row is turned to 2, not to 6 (its back to the room).
     */
    private findPlacementDirection(entity: Entity, x: number, y: number): number | null {
        const item = entity as unknown as FloorItem;
        const directions = this.getPlacementDirections(entity, this.rollingWantedDirection ?? 0);
        const [wanted, ...others] = directions;

        const facingRoom = others.filter(direction => RoomEntityRepository.FACING_ROOM.has(direction));
        const facingWalls = others.filter(direction => !RoomEntityRepository.FACING_ROOM.has(direction));

        for (const direction of [wanted, ...facingRoom, ...facingWalls]) {
            if (this.canPlaceAt(item, x, y, direction)) return direction;
        }

        return null;
    }

    /** Rotations whose front faces the room (towards the viewer): south-east and south-west. */
    private static readonly FACING_ROOM = new Set([2, 4]);

    /**
     * The rotations of the furni (e.g. 0 and 2 for a bed, 0 2 4 6 for a sofa), starting from the wanted one
     * (or the first one after it, if the furni doesn't have it).
     */
    private getPlacementDirections(entity: Entity, wanted: number): number[] {
        const available = (entity as unknown as Partial<Item>).base?.getAvailableDirections() ?? [];
        if (available.length === 0) return [wanted];

        const sorted = [...available].sort((a, b) => a - b);
        let start = sorted.findIndex(direction => direction >= wanted);
        if (start < 0) start = 0;

        return [...sorted.slice(start), ...sorted.slice(0, start)];
    }

    /**
     * Same check of the server (Room.canPlaceItemAt): all the tiles of the footprint inside the room,
     * not holes, not the door and without an avatar on them (a furni is not placed under someone).
     * The tiles removed by a floor hole furni are holes too.
     */
    private canPlaceAt(item: FloorItem, x: number, y: number, direction: number): boolean {
        if (!this.floorPlane) return true;

        const footprint = item.getFootprintAt(x, y, direction);
        const door = this.floorPlane.room.getDoorPosition();
        const blocked = this.getAvatarTilesNotUnder(item);
        const notStackable = this.getNotStackableTiles(item);

        for (let tileX = footprint.minX; tileX <= footprint.maxX; tileX++) {
            for (let tileY = footprint.minY; tileY <= footprint.maxY; tileY++) {
                const tile = this.floorPlane.getTilebyPosition(new Point(tileX, tileY));

                if (!tile || tile.type === TileType.Hole || tile.type === TileType.Door) return false;
                if (tile.coveredByFloorHole) return false;
                if (door && door.x === tileX && door.y === tileY) return false;
                if (blocked.has(`${tileX},${tileY}`)) return false;
                if (notStackable.has(`${tileX},${tileY}`)) return false;
            }
        }

        return true;
    }

    /**
     * The tiles whose highest furni doesn't allow stacking (as the server, Room.canPlaceItemAt): nothing can be
     * placed there. The furni that is being placed/moved doesn't count.
     */
    private getNotStackableTiles(item: FloorItem): Set<string> {
        const tops = new Map<string, {top: number; allowStack: boolean}>();

        this.getAll().forEach((entity: Entity) => {
            const other = entity as unknown as Partial<Item>;
            if (entity === item || typeof other.getFootprint !== 'function' || other.isInventoryGhost) return;

            const footprint = other.getFootprint();
            if (!footprint) return;

            const top = Math.max(entity.position.z, 1) + (other.getStackHeight?.() ?? 0);

            for (let x = footprint.minX; x <= footprint.maxX; x++) {
                for (let y = footprint.minY; y <= footprint.maxY; y++) {
                    const key = `${x},${y}`;
                    const current = tops.get(key);
                    if (!current || top > current.top) tops.set(key, {top, allowStack: other.allowStack !== false});
                }
            }
        });

        const tiles = new Set<string>();
        tops.forEach((value, key) => { if (!value.allowStack) tiles.add(key); });

        return tiles;
    }

    /**
     * The tiles with an avatar, but the ones under the furni that is being moved (as the server: who is
     * on it, e.g. sitting on it, doesn't block its move).
     */
    private getAvatarTilesNotUnder(item: FloorItem): Set<string> {
        const start = !item.isInventoryGhost && this.rollingStartPosition && this.rollingStartDirection !== null
            ? item.getFootprintAt(this.rollingStartPosition.x, this.rollingStartPosition.y, this.rollingStartDirection)
            : null;

        const tiles = new Set<string>();

        this.getAll().forEach((entity: Entity) => {
            // structural check: Human can't be imported here without an import cycle
            if (!('figure' in entity)) return;

            const x = Math.round(entity.position.x);
            const y = Math.round(entity.position.y);
            const underItem = start && x >= start.minX && x <= start.maxX && y >= start.minY && y <= start.maxY;

            if (!underItem) tiles.add(`${x},${y}`);
        });

        return tiles;
    }

    /** The visualization of a floor furni, that can be shown as its icon while it's placed. */
    private static placementVisualization(entity: Entity): PlacementVisualization | null {
        const item = entity as unknown as Partial<FloorItem>;
        if (typeof item.getFootprintAt !== 'function') return null;

        const visualization = entity.visualization as unknown as Partial<PlacementVisualization>;
        return typeof visualization?.setPlacementIcon === 'function'
            ? (visualization as PlacementVisualization)
            : null;
    }

    /**
     * Preview of the Z the server will give to the furni (the server calculates the real one):
     * the highest top among the tiles and the other floor items under its footprint.
     */
    private getStackHeightUnder(entity: Entity, tileZ: number): number {
        const item = entity as unknown as Partial<Item>;
        const footprint = typeof item.getFootprint === 'function' ? item.getFootprint() : null;
        if (!footprint) return tileZ;

        let height = tileZ;

        this.getAll().forEach((other: Entity) => {
            if (other === entity) return;

            const otherItem = other as unknown as Partial<Item>;
            if (typeof otherItem.getFootprint !== 'function' || otherItem.isInventoryGhost) return;

            const otherFootprint = otherItem.getFootprint();
            if (!otherFootprint) return;

            const overlaps =
                otherFootprint.minX <= footprint.maxX && otherFootprint.maxX >= footprint.minX &&
                otherFootprint.minY <= footprint.maxY && otherFootprint.maxY >= footprint.minY;

            if (!overlaps) return;

            // the height of the server: the preview goes where the server will put the furni
            const top = Math.max(other.position.z, 1) + (otherItem.getStackHeight?.() ?? 0);
            height = Math.max(height, top);
        });

        return height;
    }

    /**
     * To call when a floor item is added, moved, rotated, removed or changes state:
     * updates the floor holes and the zIndex of the humans.
     */
    onFloorItemsChanged() {
        this.refreshFloorHoles();
        this.refreshHumansDepth();
        this.refreshFrontLayers();
    }

    /**
     * The walking avatars go at once to the position the server gave them (see RoomService.onResume).
     * Only them: the others may have never got a next position from the server.
     */
    snapWalkingHumans(): void {
        this.getAll().forEach((entity: Entity) => {
            // structural check: Human can't be imported here without an import cycle
            if (!('figure' in entity)) return;

            const actions = (entity.visualization as {actions?: Set<ActionId>}).actions;
            if (actions?.has(ActionId.WALK)) entity.visualization.snapToNextPosition();
        });
    }

    /**
     * The base Z of the furni an avatar at x, y, z sits/lays on: the highest floor item on its tile that is not
     * above it (e.g. the bed, not the rug under the bed). Null if there is no furni there.
     */
    getRestingItemZ(x: number, y: number, z: number): number | null {
        const tileX = Math.round(x);
        const tileY = Math.round(y);
        let base: number | null = null;

        this.getAll().forEach((entity: Entity) => {
            const item = entity as unknown as Partial<Item>;
            if (typeof item.getFootprint !== 'function' || item.isInventoryGhost) return;

            const footprint = item.getFootprint();
            if (!footprint || tileX < footprint.minX || tileX > footprint.maxX || tileY < footprint.minY || tileY > footprint.maxY) return;

            const itemZ = entity.position.z;
            if (itemZ > z + 0.01) return;

            if (base === null || itemZ > base) base = itemZ;
        });

        return base;
    }

    /**
     * The layers of the floor items in front of the avatars on them are drawn over those avatars
     * (e.g. the front of a bath with an avatar sitting in it). To call when a floor item or an avatar
     * changes position, and after the zIndex of the avatars is calculated.
     */
    refreshFrontLayers() {
        const items: {entity: Entity; footprint: ItemFootprint}[] = [];

        this.getAll().forEach((entity: Entity) => {
            const item = entity as unknown as Partial<Item>;
            const visualization = entity.visualization as unknown as Partial<FrontLayersVisualization>;
            if (typeof item.getFootprint !== 'function' || typeof visualization?.updateFrontLayers !== 'function') return;

            // a furni that is being moved is drawn as one piece
            const footprint = item.isInventoryGhost || entity === this.rollingEntity ? null : item.getFootprint();

            if (footprint) items.push({entity, footprint});
            else visualization.updateFrontLayers([]);
        });

        const humans: {tileX: number; tileY: number; z: number; relativeDepth: number; inside: boolean; depth: number; zIndex: number}[] = [];

        this.getAll().forEach((entity: Entity) => {
            // structural check: Human can't be imported here without an import cycle
            const container = entity.visualization?.container;
            if (!('figure' in entity) || !container) return;

            const actions = (entity.visualization as {actions?: Set<ActionId>}).actions;
            const relativeDepth = actions?.has(ActionId.LAY) ? RoomDepth.AVATAR_LAYING : RoomDepth.AVATAR;
            const {x, y, z} = entity.position;

            humans.push({
                tileX: Math.round(x),
                tileY: Math.round(y),
                z,
                relativeDepth,
                inside: !!actions && (actions.has(ActionId.SIT) || actions.has(ActionId.LAY)),
                // as Nitro (RoomMessageHandler: status.z + sit height) a sitting/laying avatar is at the height of
                // the seat, that the server gives it: e.g. on a 3 seats sofa the cushion of its own seat (z 1000)
                // stays behind it and only the seats in front of it (z 2000) cover it
                depth: RoomDepth.of(x, y, z) + relativeDepth,
                zIndex: container.zIndex,
            });
        });

        for (const {entity, footprint} of items) {
            // A furni's front layers can visually overlap an avatar standing on
            // the neighboring tile (e.g. the table edge over someone on the
            // chair behind it). Include adjacent tiles as candidates; the layer
            // depth check in ItemVisualization decides whether it is actually
            // in front of that avatar.
            const overlap = 1;
            const humansOnItem = humans.filter(human =>
                human.tileX >= footprint.minX - overlap && human.tileX <= footprint.maxX + overlap &&
                human.tileY >= footprint.minY - overlap && human.tileY <= footprint.maxY + overlap);

            // A bath/tub/jacuzzi is sat in, not on: its front (one piece for all its length) covers an avatar
            // sitting on any of its tiles. The layer depths are from the furni origin, so an avatar sitting on
            // another tile is compared as if it were on the origin (on a sofa instead every seat has its own
            // layers, at +1000 z per tile, and the origin is right).
            const sitInside = RoomEntityRepository.isSitInsideFurni(entity.name);
            const origin = entity.position;

            const humansForLayers = humansOnItem.map(human => {
                const onFootprint =
                    human.tileX >= footprint.minX && human.tileX <= footprint.maxX &&
                    human.tileY >= footprint.minY && human.tileY <= footprint.maxY;

                if (!sitInside || !human.inside || !onFootprint) return human;

                return {...human, depth: RoomDepth.of(origin.x, origin.y, human.z) + human.relativeDepth};
            });

            (entity.visualization as unknown as FrontLayersVisualization).updateFrontLayers(humansForLayers);
        }
    }

    /** The furni an avatar sits in (baths, tubs, jacuzzis, pools), not the toilets of the bathroom line. */
    private static isSitInsideFurni(name: string): boolean {
        const className = (name ?? '').split('*')[0].toLowerCase();
        if (/toilet|chamberpot/.test(className)) return false;

        return /bath|tub|camme|jacuzz|pool/.test(className);
    }

    /**
     * Removes from the floor the tiles under the open floor hole furni (as Nitro's FurnitureFloorHoleLogic).
     * A hole that is being placed or moved doesn't count yet: its tiles must stay hoverable to drop it.
     */
    private refreshFloorHoles() {
        if (!this.floorPlane) return;

        const covered = new Set<string>();

        this.getAll().forEach((entity: Entity) => {
            const item = entity as unknown as Partial<Item>;
            if (item.base?.LogicType !== RoomEntityRepository.FLOOR_HOLE_LOGIC) return;
            if (item.isInventoryGhost || entity === this.rollingEntity) return;

            const state = (entity.visualization as {state?: number} | undefined)?.state ?? 0;
            if (state !== RoomEntityRepository.FLOOR_HOLE_OPEN_STATE) return;

            const footprint = item.getFootprint?.();
            if (!footprint) return;

            for (let x = footprint.minX; x <= footprint.maxX; x++) {
                for (let y = footprint.minY; y <= footprint.maxY; y++) {
                    covered.add(`${x},${y}`);
                }
            }
        });

        this.floorPlane.setFloorHoles(covered);
    }

    /**
     * Recalculates the zIndex of the humans, that depends on the floor items around them.
     */
    private refreshHumansDepth() {
        this.getAll().forEach((entity: Entity) => {
            // structural check: Human can't be imported here without an import cycle
            if (!('figure' in entity) || !entity.visualization?.container) return;

            entity.visualization.container.zIndex = entity.visualization.getZIndex();
        });
    }

    tick(delta: number) {
        this.getAll().forEach((entity: Entity) => {
            entity.logic.tick(delta);
        });
    }
}
