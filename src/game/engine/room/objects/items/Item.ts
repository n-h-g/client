import {Entity} from '../../../../core/room/object/entities/Entity';
import {ItemLogic} from '../../../../core/room/object/items/logic/ItemLogic';
import {ItemVisualization} from '../../../../core/room/object/items/visualization/ItemVisualization';
import {Point3d} from '../../../../utils/point/Point3d';
import {FurniBase} from '../../../ui/imagers/items/FurniBase';
import {ItemLogicBasic} from './logic/ItemLogicBasic';
import {ItemLogicMultiState} from './logic/ItemLogicMultiState';
import {ItemLogicDice} from './logic/ItemLogicDice';
import {ItemLogicRoomDimmer} from './logic/ItemLogicRoomDimmer';
import {ItemLogicRoomBranding} from './logic/ItemLogicRoomBranding';
import {ItemVisualizationRoomBackground} from './visualization/ItemVisualizationRoomBackground';
import {ItemVisualizationBillboard} from './visualization/ItemVisualizationBillboard';
import {ItemVisualizationAnimated} from './visualization/ItemVisualizationAnimated';
import {ItemVisualizationStatic} from './visualization/ItemVisualizationStatic';

/** The client logics of the furni by Nitro logicType (see Item.getItemLogicFromType). */
const ITEM_LOGICS: Record<string, (item: Item) => ItemLogic> = {
    furniture_basic: item => new ItemLogicBasic(item),
    furniture_multistate: item => new ItemLogicMultiState(item),
    furniture_multiheight: item => new ItemLogicMultiState(item),
    // the hole (state 0) is removed from the floor by RoomEntityRepository.refreshFloorHoles
    furniture_floor_hole: item => new ItemLogicMultiState(item),
    furniture_dice: item => new ItemLogicDice(item),
    furniture_roomdimmer: item => new ItemLogicRoomDimmer(item),
    // the room background (ads_background): an image from its data
    furniture_bg: item => new ItemLogicRoomBranding(item),
    // the billboards (ads_mpu_*): an image from its data, a click opens its link
    furniture_bb: item => new ItemLogicRoomBranding(item, true),
};

/** Inclusive rectangle of tiles covered by a floor item. */
export type ItemFootprint = {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};

export abstract class Item extends Entity {
    base: FurniBase;

    /**
     * True for the preview created while placing an item from the inventory:
     * its id is the inventory item id, not the id of a room entity.
     */
    isInventoryGhost = false;
    /**
     * The stack height of the server (what is placed on this item goes at its Z + this height): null for the
     * furni not sent by the server (e.g. the preview from the inventory), that use the height of the Nitro data.
     */
    stackHeight: number | null = null;
    /**
     * The data of the furni sent by the server (interaction.extraData): usually its state, a number; some furni
     * have other data, e.g. a room dimmer "state,preset,effect,color,brightness" (see ItemLogic.onExtraData).
     */
    extraData: number | string | null = null;
    /** Something can be placed on this furni (the server's items_base.allow_stack, e.g. not on many chairs). */
    allowStack = true;

    /** The height used to stack the furni on this one: the server's, else the logic height of the furni. */
    getStackHeight(): number {
        return this.stackHeight ?? this.base?.getLogicDimension(2) ?? 0;
    }

    constructor(
        id: string,
        name: string,
        position: Point3d,
        furniBase: FurniBase
    ) {
        super(id, name);
        this.position = position;
        this.base = furniBase;

        this.visualization = this.getItemVisualizationFromType(
            this.base.data.visualization.type
        );
        this.logic = this.getItemLogicFromType(this.base.data.logic.type);
    }

    abstract calculateOffsetX(): number;

    abstract calculateOffsetY(): number;

    /**
     * Tiles covered by the item, or null if it doesn't stand on the floor (wall items).
     */
    getFootprint(): ItemFootprint | null {
        return null;
    }

    private getItemVisualizationFromType(type: string): ItemVisualization {
        switch (type) {
            default:
            case 'furniture_static':
                return new ItemVisualizationStatic(this);
            case 'furniture_animated':
                return new ItemVisualizationAnimated(this);
            case 'furniture_bg':
                return new ItemVisualizationRoomBackground(this);
            case 'furniture_bb':
                return new ItemVisualizationBillboard(this);
        }
    }

    /**
     * The logic of the furni by its logicType (as Nitro's RoomObjectLogicFactory): what a click does, e.g. which
     * packet it sends. A type not in ITEM_LOGICS is a basic furni.
     */
    private getItemLogicFromType(type: string): ItemLogic {
        return (ITEM_LOGICS[type] ?? ITEM_LOGICS.furniture_basic)(this);
    }
}
