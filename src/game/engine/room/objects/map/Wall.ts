import LogicWall from "./logic/LogicWall"
import VisualizationWall from "./visualization/VisualizationWall"
import RoomObjectController from "../../../../core/room/object/RoomObjectController"
import IRoomMapObject from "../../../../core/room/object/map/IRoomMapObject"
import WallType from ".//WallTypeEnum"
import Point3d from "../../../../utils/point/Point3d"
import ColorRGB from "../../../../utils/color/ColorRGB"
import RoomPlane from "./RoomPlane"

export default class Wall extends RoomObjectController implements IRoomMapObject{

    private plane: RoomPlane

    private type: WallType
    private color: ColorRGB

    private corner: boolean
    private last: boolean


    constructor(plane: RoomPlane, id: string, position: Point3d, type: WallType, isCorner: boolean, isLast: boolean, color: ColorRGB) {
        super(id, position, null, null)

        this.plane = plane

        this.type = type
        this.color = color

        this.corner = isCorner
        this.last = isLast;

        this.visualization = (new VisualizationWall(this))
        this.logic = (new LogicWall(this))
    }

    public getColor(): ColorRGB {
        return this.color
    }

    public getType(): WallType {
        return this.type
    }

    public isCorner() : boolean {
        return this.corner
    }

    public isLast() : boolean {
        return this.last
    }

    public getPlane(): RoomPlane {
        return this.plane
    }
}