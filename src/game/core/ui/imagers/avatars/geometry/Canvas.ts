import {Node3d} from '../../../../../utils/node/Node3d';
import {Point3d} from '../../../../../utils/point/Point3d';

export abstract class Canvas extends Node3d {
    id: string;
    offsets: Point3d;

    constructor(
        id: string,
        height: number,
        width: number,
        offsets: Point3d
    ) {
        super(height, width, offsets);

        this.id = id;
        this.offsets = offsets;
    }

    getOffsets(): Point3d {
        return this.offsets;
    }
}
