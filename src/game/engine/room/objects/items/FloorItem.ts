import {Point3d} from '../../../../utils/point/Point3d';
import {FurniBase} from '../../../ui/imagers/items/FurniBase';
import {Item} from './Item';

export class FloorItem extends Item {
    constructor(
        id = '',
        name = '',
        position: Point3d = new Point3d(0, 0, 0),
        baseItem: FurniBase = null
    ) {
        super(id, name, position, baseItem);
    }
}
