import {Node3d} from '../../../../../utils/node/Node3d';
import {Point3d} from '../../../../../utils/point/Point3d';
import {Item} from '../gamedata/IAvatarGeometry';

export class GeometryItem extends Node3d {
    id: string;

    constructor(geometryItemData: Item) {
        super(
            geometryItemData.x,
            geometryItemData.y,
            new Point3d(
                geometryItemData.nx,
                geometryItemData.ny,
                geometryItemData.nz
            )
        );
        this.id = geometryItemData.id;
    }
}
