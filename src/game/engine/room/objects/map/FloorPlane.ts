import {RoomPlaneType} from './RoomPlaneTypeEnum';
import {ColorRGB} from '../../../../utils/color/ColorRGB';
import {TileType} from './TileTypeEnum';
import {MapTypeChecker} from './MapTypeChecker';
import {Point3d} from '../../../../utils/point/Point3d';
import {RoomLayout} from '../../RoomLayout';
import {Point} from '../../../../utils/point/Point';
import {RoomPlane} from './RoomPlane';
import {Tile} from './Tile';

export class FloorPlane extends RoomPlane {
    constructor(room: RoomLayout) {
        super(room, RoomPlaneType.Floor);
    }

    prepareTiles(): void {
        this.room.getModelMaltrix().forEach((xRow, x) => {
            xRow.forEach((_, y) => {
                const position = new Point3d(
                    x,
                    y,
                    this.room.getModelMaltrix()[x][y]
                );

                this.addObject(
                    new Tile(
                        this,
                        `tile${position.x}-${position.y}`,
                        position,
                        MapTypeChecker.checkTileType(
                            position,
                            this.room.getDoorPosition(),
                            this.room.getModelMaltrix()
                        ),
                        this.room.getUniqueColor()
                    )
                );
            });
        });
    }

    getRandomTile() {
        const tiles = [];

        let tile = false;

        while (!tile) {
            const object =
                this.mapObjects[
                    Math.floor(Math.random() * this.mapObjects.length)
                ];

            if (object instanceof Tile) {
                if (object.type != TileType.Hole) {
                    tile = true;
                    return object;
                }
            }
        }
        return tiles;
    }

    setTileType(x: number, y: number, type: TileType): void {
        this.mapObjects.find(obj => {
            if (obj instanceof Tile) {
                if (obj.position.x == x && obj.position.y == y) {
                    obj.type = type;
                    if (type == TileType.Hole) {
                        this.room.setModelMatrixElement(x, y, 0);
                    }
                }
            }
        });
    }

    getTileByColor(color: ColorRGB): Tile {
        return this.mapObjects.find(obj => {
            if (obj instanceof Tile) {
                if (obj.color.equals(color)) {
                    return obj;
                }
            }
        }) as Tile;
    }

    getTilebyPosition(point: Point): Tile {
        return this.mapObjects.find(obj => {
            if (obj instanceof Tile) {
                if (
                    obj.position.x === point.x &&
                    obj.position.y === point.y
                ) {
                    return obj;
                }
            }
        }) as Tile;
    }

    getTileByName(name: string): Tile {
        return this.mapObjects.find(obj => {
            if (obj instanceof Tile) {
                if (obj.id === name) {
                    return obj;
                }
            }
        }) as Tile;
    }

    getTiles(): Array<Tile> {
        return this.mapObjects as Array<Tile>;
    }
}
