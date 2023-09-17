import {IDirection} from '../../../../../core/ui/imagers/items/IVisualization';

export class DirectionData {
    private direction = 0;

    private z = 0;

    static USE_DEFAULT_DIRECTION = -1;

    constructor(direction: number, data: IDirection) {
        this.direction = direction;
    }

    getOffsetZ(): number {
        return this.z;
    }
}
