import { Entity } from '../../../../core/room/object/entities/Entity'
import { ItemLogic } from '../../../../core/room/object/items/logic/ItemLogic'
import Point3d from '../../../../utils/point/Point3d'
import FurniBase from '../../../ui/imagers/items/FurniBase'
import ItemLogicBasic from './logic/ItemLogicBasic'
import ItemLogicMultiState from './logic/ItemLogicMultiState'
import ItemVisualizationAnimated from './visualization/ItemVisualizationAnimated'
import { default as ItemVisualization, default as ItemVisualizationStatic } from './visualization/ItemVisualizationStatic'

export default abstract class Item extends Entity {
    public base: FurniBase

    constructor(id: string, name: string, position: Point3d, furniBase) {
        super(id, name)
        this.position = position
        this.base = furniBase
        this.visualization = this.getItemVisualizationFromType(this.base.data.visualization.type)
        this.logic = this.getItemLogicFromType(this.base.data.logic.type)
    }

    private getItemVisualizationFromType(type: string): ItemVisualization {
        switch (type) {
            default:
            case 'furniture_static':
                return new ItemVisualizationStatic(this)
            case 'furniture_animated':
                return new ItemVisualizationAnimated(this)
        }
    }

    private getItemLogicFromType(type: string): ItemLogic {
        switch (type) {
            default:
            case 'furniture_basic':
                return new ItemLogicBasic(this)
            case 'furniture_multistate':
                return new ItemLogicMultiState(this)
        }
    }
}