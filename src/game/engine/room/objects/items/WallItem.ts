import Point3d from '../../../../utils/point/Point3d'
import { FurniSprite } from '../../../ui/imagers/items/FurniSprite'
import Item from './Item'

export default class WallItem extends Item {
    constructor(id: string = '', name: string = '', base: FurniSprite = null) {
        super(id, name, new Point3d(0, 0, 0), base)
    }
}