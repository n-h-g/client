import {Node3d} from '../../../../../utils/node/Node3d';
import {Point3d} from '../../../../../utils/point/Point3d';

export class GeometryNode extends Node3d {
    constructor(height: number, width: number, dx: number, dy: number) {
        super(height, width, new Point3d(dx, dy, 0));
    }
}
