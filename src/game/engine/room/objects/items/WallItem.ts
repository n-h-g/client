import {Point3d} from '../../../../utils/point/Point3d';
import {Furni} from '../../../ui/imagers/items/Furni';
import { FurniBase } from '../../../ui/imagers/items/FurniBase';
import { MapData } from '../map/MapData';
import {Item} from './Item';
import { FurnitureWallData } from './WallItemData';
import { Wall } from '../map/Wall';
import { WallType } from '../map/WallTypeEnum';

export class WallItem extends Item {

    private _wallData: FurnitureWallData;
    previewOffset: {x: number; y: number} | null = null;
    placementWall: Wall | null = null;
    placementLocalX = 0;
    placementLocalY = 0;

    constructor(id = '', name = '',  baseItem: FurniBase = null, wallData: FurnitureWallData) {
        super(id, name, new Point3d(0, 0, 0), baseItem);

        this._wallData = wallData;
        // A wall furni's facing is encoded in its saved wall location. The base
        // entity visualization defaults to SOUTH (3), which is incorrect for
        // the two canonical wall sides (2 and 4).
        this.visualization.direction = Number(wallData.direction);
    }

    calculateOffsetX(): number {
        if (this.isInventoryGhost && this.previewOffset) return this.previewOffset.x;
        const parsed = this._wallData;
        const tileWidth = MapData.tileWidth;
        const tileHeight = MapData.tileHeight;

        let x = (parsed.height * tileHeight) - (parsed.width * tileWidth) / 2;
        
        x += MapData.wallWidth - MapData.wallDepth;

        if (parsed.side === 'l') {
            x -= parsed.localX;
        } else {
            x += parsed.localX;
        }

        return x;
    }
    calculateOffsetY(): number {
        if (this.isInventoryGhost && this.previewOffset) return this.previewOffset.y;
        const parsed = this._wallData;
        const tileWidth = MapData.tileWidth;
        const tileHeight = MapData.tileHeight;

        let y = (parsed.height * tileHeight) / 2 + (parsed.width * tileWidth) / 4;

        y += MapData.wallDepth + MapData.wallBlankBottom;

        y += (parsed.localX / 2);

        y -= parsed.localY;

        y += 120;

        return y;
    }

    setPlacement(wall: Wall, localX: number, localY: number): void {
        this.placementWall = wall;
        this.placementLocalX = Math.max(0, Math.round(localX));
        this.placementLocalY = Math.max(0, Math.round(localY));
    }

    getWallLocation(): string | null {
        if (!this.placementWall) return null;
        const isLeft = this.placementWall.type === WallType.Left || this.placementWall.type === WallType.DoorLeft;
        const side = isLeft ? 'l' : 'r';
        return `:w=${this.placementWall.position.x},${this.placementWall.position.y} l=${this.placementLocalX},${this.placementLocalY} ${side}`;
    }

    get wallData(): FurnitureWallData {
        return this._wallData;
    }
}
