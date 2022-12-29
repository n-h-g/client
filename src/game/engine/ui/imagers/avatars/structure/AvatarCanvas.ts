
import Canvas from "../../../../../core/ui/imagers/avatars/geometry/Canvas";
import GeometryNode from "../../../../../core/ui/imagers/avatars/geometry/GeometryNode";
import Node3d from "../../../../../utils/node/Node3d";
import Point from "../../../../../utils/point/Point";
import Point3d from "../../../../../utils/point/Point3d";
import IAvatarGeometry, { ICanvas, IGeometryElement } from "../gamedata/IAvatarGeometry";

export class AvatarCanvas extends Canvas {
    public scale: string;

    public constructor(scale: string, geometry: IGeometryElement) {
        super(geometry.id, geometry.height, geometry.width, new Point3d(geometry.dx, geometry.dy, 0));

        this.id = geometry.id;
        this.scale = scale;
    }
}