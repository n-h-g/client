import {Point3d} from '../../../../utils/point/Point3d';
import {FurniBase} from '../../../ui/imagers/items/FurniBase';
import { FurniData } from '../../../ui/imagers/items/FurniData';
import { MapData } from '../map/MapData';
import {Item, ItemFootprint} from './Item';

export class FloorItem extends Item {
    /** Rotation of a furni placed from the inventory (the R key rotates it while placing). */
    static DEFAULT_PLACEMENT_ROTATION = 2;

    constructor(
        id = '',
        name = '',
        position: Point3d = new Point3d(0, 0, 0),
        baseItem: FurniBase = null
    ) {
        super(id, name, position, baseItem);
    }

    /**
     * Same footprint of the server (Item.getSizeX/getSizeY): the logic dimensions are [width, length, height],
     * rotations 0/4 put the length on X, rotations 2/6 the width.
     */
    getFootprint(): ItemFootprint {
        return this.getFootprintAt(this.position.x, this.position.y, this.visualization?.direction ?? 0);
    }

    /**
     * The footprint the item would have with its origin on x, y and the given rotation
     * (e.g. to find a rotation that fits while placing it).
     */
    getFootprintAt(x: number, y: number, rotation: number): ItemFootprint {
        const width = Math.max(1, Math.round(this.base?.getLogicDimension(0) || 1));
        const length = Math.max(1, Math.round(this.base?.getLogicDimension(1) || 1));
        const isRotatedOnLength = Math.floor(rotation / 2) % 2 === 0;

        const minX = Math.round(x);
        const minY = Math.round(y);

        return {
            minX,
            minY,
            maxX: minX + (isRotatedOnLength ? length : width) - 1,
            maxY: minY + (isRotatedOnLength ? width : length) - 1,
        };
    }

    calculateOffsetX(): number {
        const x = this.position.x;
        const y = this.position.y;

        const tileBaseX = ((y - x) * MapData.tileWidth) / 2;

        
        // the furni are anchored at the center of their tile (as in Habbo)
        return tileBaseX + (MapData.tileWidth / 2);
    }
    calculateOffsetY(): number {
        const x = this.position.x;
        const y = this.position.y;
        const z = this.position.z;

        const tileBaseY = ((y + x) * MapData.tileHeight) / 2;

        // The server sends the absolute Z (floor tile = 1, an item stacked on a 0.5 high item = 1.5, ...).
        // Z 0 is kept for items saved before the heights were handled: they are on the floor.
        const heightFromFloor = Math.max(z, 1) - 1;
        const zOffset = heightFromFloor * MapData.thickSpace * MapData.stairSteps;

        return tileBaseY + (MapData.tileHeight / 2) - FurniData.FURNI_TOP_OFFSET - zOffset;
    }
}
