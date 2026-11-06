import {Entity} from '../../../../core/room/object/entities/Entity';
import {ItemLogic} from '../../../../core/room/object/items/logic/ItemLogic';
import {ItemVisualization} from '../../../../core/room/object/items/visualization/ItemVisualization';
import {Point3d} from '../../../../utils/point/Point3d';
import {FurniBase} from '../../../ui/imagers/items/FurniBase';
import {ItemLogicBasic} from './logic/ItemLogicBasic';
import {ItemLogicMultiState} from './logic/ItemLogicMultiState';
import {ItemVisualizationAnimated} from './visualization/ItemVisualizationAnimated';
import {ItemVisualizationStatic} from './visualization/ItemVisualizationStatic';

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
        }
    }

    private getItemLogicFromType(type: string): ItemLogic {
        switch (type) {
            default:
            case 'furniture_basic':
                return new ItemLogicBasic(this);
            case 'furniture_multistate':
            case 'furniture_multiheight':
            // the hole (state 0) is removed from the floor by RoomEntityRepository.refreshFloorHoles
            case 'furniture_floor_hole':
                return new ItemLogicMultiState(this);
        }
    }
}
