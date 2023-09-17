import {ILayer} from '../../../../../core/ui/imagers/items/ILayer';

export class Layer {
    z: number;
    alpha: number;
	ignoreMouse: boolean;
    ink: string;

    private wrappedId: number;

    constructor(id: number, data: ILayer) {
        this.wrappedId = id;
        this.ignoreMouse = data.ignoreMouse;
        this.alpha = data.alpha;
        this.z = data.z;
        this.ink = data.ink;
    }

    get id(): number {
        return this.wrappedId;
    }
}
