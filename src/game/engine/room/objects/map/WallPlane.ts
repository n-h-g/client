import RoomPlaneType from "./RoomPlaneTypeEnum";
import RoomPlane from "./RoomPlane";
import MapTypeChecker from "./MapTypeChecker";
import WallType from "./WallTypeEnum";
import Point3d from "../../../../utils/point/Point3d";
import Wall from "./Wall";
import RoomLayout from "../../RoomLayout";

export default class WallPlane extends RoomPlane {

    constructor(room: RoomLayout, isRight: boolean = false) {
        super(room, isRight ? RoomPlaneType.RightWall : RoomPlaneType.LeftWall)
    }

    public prepareWalls() : void {
        let minY = this.getRoom().getModelMaltrix()[0].length
        let minX = this.getRoom().getModelMaltrix().length
        let isCorner = false
        let isDoor = false
        let isLast = false;

        for (let x = 0; x < this.getRoom().getModelMaltrix().length; x++) {
            for (let y = 0; y < this.getRoom().getModelMaltrix()[x].length; y++) {

                
                isCorner = MapTypeChecker.checkWallCorner(x, y, this.getRoom().getModelMaltrix());

                isDoor = false
                if (x == this.getRoom().getDoorPosition().getX() && y - 1 == this.getRoom().getDoorPosition().getY()) {
                    isDoor = true
                }

                isLast = false;
                if (!this.getRoom().getModelMaltrix()[x+1] || this.getRoom().getModelMaltrix()[x+1] && this.getRoom().getModelMaltrix()[x+1][y] == 0) {
                    isLast = true;
                }

                if (y <= minY && this.getRoom().getModelMaltrix()[x][y] != 0) {
                    if (minY > y) {
                        minY = y;
                    }
                    
                    this.addMapObject(new Wall(
                        this,
                        `wall${ x }-${ y }`,
                        new Point3d(x, y, this.getRoom().getModelMaltrix()[x][y]),
                        isDoor ? WallType.DoorLeft : WallType.Left,
                        isCorner,
                        isLast,
                        this.getRoom().getUniqueColor()
                    )) 
                }
            }
        }

        for (let y = 0; y < this.getRoom().getModelMaltrix()[0].length; y++) {
            for (let x = 0; x < this.getRoom().getModelMaltrix().length; x++) {

                
                isCorner = MapTypeChecker.checkWallCorner(x, y, this.getRoom().getModelMaltrix());

                isDoor = false
                if (x - 1 == this.getRoom().getDoorPosition().getX() && y == this.getRoom().getDoorPosition().getY()) {
                    isDoor = true
                }

                isLast = false;
                if (!this.getRoom().getModelMaltrix()[x][y+1] || this.getRoom().getModelMaltrix()[x][y+1] && this.getRoom().getModelMaltrix()[x][y+1] == 0) {
                    isLast = true;
                }

                if (x <= minX && this.getRoom().getModelMaltrix()[x][y] != 0) {
                    if (minX > x) {
                        minX = x;
                    }                    

                    this.addMapObject(new Wall(
                        this,
                        `wall${ x }-${ y }`,
                        new Point3d(x, y, this.getRoom().getModelMaltrix()[x][y]),
                        isDoor ? WallType.DoorRight : WallType.Right,
                        isCorner,
                        isLast,
                        this.getRoom().getUniqueColor()
                    ))
                }
            }
        }
    }

    public getWalls() : Array<Wall> {
        return this.getMapObjects() as Array<Wall>
    }

}