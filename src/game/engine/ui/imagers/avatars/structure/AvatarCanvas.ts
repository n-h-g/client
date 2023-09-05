import Canvas from "../../../../../core/ui/imagers/avatars/geometry/Canvas";
import { Point3d } from "../../../../../utils/point/Point3d";
import { IGeometryElement } from "../gamedata/IAvatarGeometry";

export class AvatarCanvas extends Canvas {
    public scale: string;

    public constructor(scale: string, geometry: IGeometryElement) {
        super(geometry.id, geometry.height, geometry.width, new Point3d(geometry.dx, geometry.dy, 0));

        this.id = geometry.id;
        this.scale = scale;
    }
}