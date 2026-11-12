import {Item} from '../Item';
import {ItemLogic} from '../../../../../core/room/object/items/logic/ItemLogic';
import {Engine} from '../../../../../Engine';
import type {ItemVisualizationBranded} from '../visualization/ItemVisualizationBranded';

/** The data of a room background or a billboard (Nitro's FurnitureRoomBrandingLogic keys). */
export interface RoomBranding {
    /** 0 as it is, 1 flipped horizontally, 2 both, 3 vertically. */
    state: number;
    imageUrl: string;
    clickUrl: string;
    offsetX: number;
    offsetY: number;
    offsetZ: number;
}

/**
 * A room background (logicType furniture_bg: ads_background, Nitro's FurnitureRoomBackgroundLogic) or a billboard
 * (furniture_bb: ads_mpu_*, FurnitureRoomBillboardLogic), as Nitro's FurnitureRoomBrandingLogic: its data (the server's
 * RoomAdsInteraction, "key=value" separated by tabs as Arcturus) is the image drawn by ItemVisualizationBranded.
 * - a double click does nothing;
 * - a click selects it (the infostand edits it, PreviewBoxGUI) only for the owner of the room: Nitro's
 *   isFurnitureSelectionDisabled lets only a moderator select it;
 * - a click on a billboard opens its clickUrl (an http link), for everyone.
 */
export class ItemLogicRoomBranding extends ItemLogic {
    /** The data of the furni now: the infostand shows it. */
    branding: RoomBranding = ItemLogicRoomBranding.parse(null);

    /**
     * @param hasClickUrl a billboard: a click opens its clickUrl (a room background has none, Nitro's
     *                    FurnitureRoomBackgroundLogic.getAdClickUrl).
     */
    constructor(item: Item, private readonly hasClickUrl = false) {
        super(item);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDoubleClick(spriteTag?: string) {}

    onClick(): void {
        if (Engine.getInstance()?.roomService?.ownsCurrentRoom()) super.onClick();

        const url = this.branding.clickUrl;
        if (this.hasClickUrl && /^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener');
    }

    onLoad(): void {
        super.onLoad();
        this.onExtraData((this.entity as Item).extraData);
    }

    onExtraData(data: number | string | null): void {
        this.branding = ItemLogicRoomBranding.parse(data);

        const visualization = this.entity.visualization as ItemVisualizationBranded;
        visualization?.setBranding?.(this.branding);
    }

    /** The data of the furni, the defaults for what it doesn't have (e.g. just bought: no image). */
    static parse(data: number | string | null): RoomBranding {
        const values = new Map<string, string>();

        if (typeof data === 'string') {
            for (const entry of data.split('\t')) {
                // the URLs can contain '=' (a query string): the key ends at the first one
                const separator = entry.indexOf('=');
                if (separator > 0) values.set(entry.slice(0, separator), entry.slice(separator + 1));
            }
        }

        const number = (key: string) => {
            const value = parseInt(values.get(key) ?? '', 10);
            return Number.isFinite(value) ? value : 0;
        };

        return {
            state: number('state'),
            imageUrl: values.get('imageUrl') ?? '',
            clickUrl: values.get('clickUrl') ?? '',
            offsetX: number('offsetX'),
            offsetY: number('offsetY'),
            offsetZ: number('offsetZ'),
        };
    }
}
