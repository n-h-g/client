import { RoomPlaneType } from './RoomPlaneTypeEnum'
import { RoomPlane } from './RoomPlane'
import MapTypeChecker from './MapTypeChecker'
import { WallType } from './WallTypeEnum'
import { Point3d } from '../../../../utils/point/Point3d'
import { Wall } from './Wall'
import RoomLayout from '../../RoomLayout'

export class WallPlane extends RoomPlane {
    constructor(room: RoomLayout, isRight: boolean = false) {
        super(room, isRight ? RoomPlaneType.RightWall : RoomPlaneType.LeftWall)
    }

    public prepareWalls(): void {
        let minY = this.room.getModelMaltrix()[0].length
        let minX = this.room.getModelMaltrix().length
        let isCorner = false
        let isDoor = false
        let isLast = false
        let doorX = this.room.getDoorPosition().getX()
        let doorY = this.room.getDoorPosition().getY()

        for (let x = 0; x < this.room.getModelMaltrix().length; x++) {
            for (let y = 0; y < this.room.getModelMaltrix()[x].length; y++) {
                isCorner = MapTypeChecker.checkWallCorner(x, y, this.room.getModelMaltrix())

                isDoor = false
                if (x == doorX && y - 1 == doorY) {
                    isDoor = true
                }

                isLast = false
                if (!this.room.getModelMaltrix()[x + 1] || this.room.getModelMaltrix()[x + 1] && this.room.getModelMaltrix()[x + 1][y] == 0) {
                    isLast = true
                }

                if (y <= minY && this.room.getModelMaltrix()[x][y] != 0 && !(x == doorX && y == doorY)) {
                    if (minY > y) {
                        minY = y
                    }

                    this.addObject(new Wall(
                        this,
                        `wall${x}-${y}`,
                        new Point3d(x, y, this.room.getModelMaltrix()[x][y]),
                        isDoor ? WallType.DoorLeft : WallType.Left,
                        isCorner,
                        isLast,
                        this.room.getUniqueColor()
                    ))
                }
            }
        }

        for (let y = 0; y < this.room.getModelMaltrix()[0].length; y++) {
            for (let x = 0; x < this.room.getModelMaltrix().length; x++) {
                isCorner = MapTypeChecker.checkWallCorner(x, y, this.room.getModelMaltrix())

                isDoor = false
                if (x - 1 == doorX && y == doorY) {
                    isDoor = true
                }

                isLast = false
                if (!this.room.getModelMaltrix()[x][y + 1] || this.room.getModelMaltrix()[x][y + 1] && this.room.getModelMaltrix()[x][y + 1] == 0) {
                    isLast = true
                }

                if (x <= minX && this.room.getModelMaltrix()[x][y] != 0 && !(x == doorX && y == doorY)) {
                    if (minX > x) {
                        minX = x
                    }

                    this.addObject(new Wall(
                        this,
                        `wall${x}-${y}`,
                        new Point3d(x, y, this.room.getModelMaltrix()[x][y]),
                        isDoor ? WallType.DoorRight : WallType.Right,
                        isCorner,
                        isLast,
                        this.room.getUniqueColor()
                    ))
                }
            }
        }
    }

    public getWalls(): Array<Wall> {
        return this.mapObjects as Array<Wall>
    }
}