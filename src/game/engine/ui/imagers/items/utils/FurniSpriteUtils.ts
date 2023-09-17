import {BLEND_MODES} from 'pixi.js';
import {NameColorPair} from '../enum/NameColorPair';

export class FurniSpriteUtils {
    public static getBlendModeFromInk(ink: string) {
        if (ink.toString() == '33') {
            return BLEND_MODES.ADD;
        }

        switch (ink) {
            case 'ADD':
                return BLEND_MODES.ADD;
            case 'SUBTRACT':
                return BLEND_MODES.SUBTRACT;
            case 'DARKEN':
                return BLEND_MODES.DARKEN;
            default:
                return BLEND_MODES.NORMAL;
        }
    }

    public static hex2int(hex: string): number {
        return parseInt(hex, 16);
    }

    public static splitItemNameAndColor = (itemName: string): NameColorPair => {
        let colorId = 0;
        if (itemName.includes('*')) {
            const longFurniName = itemName.split('*');
            itemName = longFurniName[0];
            colorId = parseInt(longFurniName[1]);
        }
        return {
            itemName,
            colorId,
        };
    };

    public static layerFromNumber(layer: number): string {
        return String.fromCharCode(layer + 97); // a
    }
}
