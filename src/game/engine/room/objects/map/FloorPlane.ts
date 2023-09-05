import { RoomPlaneType } from './RoomPlaneTypeEnum'
import { ColorRGB } from '../../../../utils/color/ColorRGB'
import { TileType } from './TileTypeEnum'
import MapTypeChecker from './MapTypeChecker'
import { Point3d } from '../../../../utils/point/Point3d'
import RoomLayout from '../../RoomLayout'
import Point from '../../../../utils/point/Point'
import { RoomPlane } from './RoomPlane'
import { Tile } from './Tile'

export class FloorPlane extends RoomPlane {
    constructor(room: RoomLayout) {
        super(room, RoomPlaneType.Floor)
    }

    public prepareTiles(): void {
        this.room.getModelMaltrix().forEach((xRow, x) => {
            xRow.forEach((_, y) => {

                let position = new Point3d(x, y, this.room.getModelMaltrix()[x][y])

                this.addObject(new Tile(
                    this,
                    `tile${position.getX()}-${position.getY()}`,
                    position,
                    MapTypeChecker.checkTileType(position, this.room.getDoorPosition(), this.room.getModelMaltrix()),
                    this.room.getUniqueColor()
                ))
            })
        })
    }

    public getRandomTile() {

        let tiles = [];

        let tile = false;

        while(!tile) {
            let object = this.mapObjects[Math.floor(Math.random()*this.mapObjects.length)];

            if(object instanceof Tile) {
                if(object.type != TileType.Hole) {
                    tile = true;
                    return object;
                }
            }

        }
        return tiles;
    }

    public setTileType(x: number, y: number, type: TileType): void {
        this.mapObjects.find((obj) => {
            if (obj instanceof Tile) {
                if (obj.position.getX() == x && obj.position.getY() == y) {
                    obj.type = type
                    if (type == TileType.Hole) {
                        this.room.setModelMatrixElement(x, y, 0)
                    }
                }
            }
        })
    }

    public getTileByColor(color: ColorRGB): Tile {
        return this.mapObjects.find((obj) => {
            if (obj instanceof Tile) {
                if (obj.color.equals(color)) {
                    return obj
                }
            }
        }) as Tile
    }

    public getTilebyPosition(point: Point): Tile {
        return this.mapObjects.find((obj) => {
            if (obj instanceof Tile) {
                if (obj.position.getX() === point.getX() && obj.position.getY() === point.getY()) {
                    return obj
                }
            }
        }) as Tile
    }

    public getTileByName(name: string): Tile {
        return this.mapObjects.find((obj) => {
            if (obj instanceof Tile) {
                if (obj.id === name) {
                    return obj
                }
            }
        }) as Tile
    }

    public getTiles(): Array<Tile> {
        return this.mapObjects as Array<Tile>
    }
}