import Point3d from "../../../../utils/point/Point3d";
import IRoomObjectVisualization from "../IRoomObjectVisualization";

export default interface IEntityVisualization extends IRoomObjectVisualization {
    position: Point3d
}