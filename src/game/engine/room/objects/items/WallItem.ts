import {Point3d} from '../../../../utils/point/Point3d';
import {Furni} from '../../../ui/imagers/items/Furni';
import {Item} from './Item';

export class WallItem extends Item {
    constructor(id = '', name = '', base: Furni = null) {
        super(id, name, new Point3d(0, 0, 0), base.furniBase);
    }
}
