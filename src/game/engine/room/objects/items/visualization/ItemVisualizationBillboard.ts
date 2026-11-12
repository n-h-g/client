import {BrandedImage} from '../../../../ui/imagers/items/Furni';
import {Item} from '../Item';
import {RoomBranding} from '../logic/ItemLogicRoomBranding';
import {ItemVisualizationBranded} from './ItemVisualizationBranded';

/**
 * A billboard (visualizationType furniture_bb: ads_mpu_160, ads_mpu_300, ads_mpu_720), as Nitro's
 * FurnitureBBVisualization: the image of its data at the offset of its branded_image layer, moved by offsetX/Y,
 * offsetZ added to the depth of the layer. It stands in the room as any furni.
 */
export class ItemVisualizationBillboard extends ItemVisualizationBranded {
    constructor(item: Item) {
        super(item);
    }

    protected imagePlacement(branding: RoomBranding): Pick<BrandedImage, 'anchor' | 'offsetZ'> {
        return {anchor: 'layer', offsetZ: branding.offsetZ};
    }
}
