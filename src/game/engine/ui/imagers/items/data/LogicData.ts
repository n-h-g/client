import {ILogic} from '../../../../../core/ui/imagers/items/ILogic';
import {IDirection} from '../../../../../core/ui/imagers/items/IVisualization';
import {DirectionData} from './DirectionData';

export class LogicData {
    private _directions: number[];
    private _dimensions: number[];

    constructor(data: ILogic) {
        this._directions = [];

        this._directions = data.directions;
        this._dimensions = data.dimensions;
    }

    getDimensions(): number[] {
        return this._dimensions;
    }
}
