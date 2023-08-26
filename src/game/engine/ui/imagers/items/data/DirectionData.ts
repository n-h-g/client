import { IDirection } from "../../../../../core/ui/imagers/items/IVisualization";

export class DirectionData {
    
    private _direction: number = 0;

    private _z: number = 0;

    public static USE_DEFAULT_DIRECTION: number = -1;

    public constructor(direction: number, data: IDirection) {
        this._direction = direction;
    }
}