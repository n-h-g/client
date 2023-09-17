import {ILogic} from '../../../../../core/ui/imagers/items/ILogic';

export class LogicData {
    private directions: number[];
    private dimensions: number[];

    constructor(data: ILogic) {
        this.directions = [];

        this.directions = data.directions;
        this.dimensions = data.dimensions;
    }

    getDimensions(): number[] {
        return this.dimensions;
    }
}
