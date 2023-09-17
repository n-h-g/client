import {IDirection} from '../../../../../core/ui/imagers/items/IVisualization';

export class DirectionData {
    private _direction = 0;

    private _z = 0;

    public static USE_DEFAULT_DIRECTION = -1;

    public constructor(direction: number, data: IDirection) {
        this._direction = direction;
    }

    public getOffsetZ(): number {
        return this._z;
    }
}
