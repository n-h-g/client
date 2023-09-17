import {ColorRGB} from '../../../utils/color/ColorRGB';
import {NormalType} from './NormalTypeEnum';

export class RoomVisualizationColorData {
    static MASK_BRIGHTNESS_LIGHT = 0;
    static MASK_BRIGHTNESS_MEDIUM = -10;
    static MASK_BRIGHTNESS_DARK = -20;
    static WALL_COLOR = 0xa5afc0;
    static TILE_COLOR = 0x969664;

    static getNormal(color: ColorRGB, type: NormalType): ColorRGB {
        if (type == NormalType.DARK) {
            return color.brightness(
                RoomVisualizationColorData.MASK_BRIGHTNESS_DARK
            );
        }
        if (type == NormalType.MEDIUM) {
            return color.brightness(
                RoomVisualizationColorData.MASK_BRIGHTNESS_MEDIUM
            );
        }
        return color.brightness(
            RoomVisualizationColorData.MASK_BRIGHTNESS_LIGHT
        );
    }
}
