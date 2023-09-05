import Node3d from '../../../../../utils/node/Node3d'
import { Point3d } from '../../../../../utils/point/Point3d'

export default abstract class Canvas extends Node3d{
    public id: string;
    public offsets: Point3d

    public constructor(id: string, height: number, width: number, offsets: Point3d) {
        super(height, width, offsets);

        this.id = id;
        this.offsets = offsets;
    }

    public getOffsets(): Point3d {
        return this.offsets;
    }
}