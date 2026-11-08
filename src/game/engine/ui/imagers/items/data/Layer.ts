import {ILayer} from '../../../../../core/ui/imagers/items/ILayer';

export class Layer {
    z: number;
    alpha: number;
	ignoreMouse: boolean;
    ink: string;
    /** Nitro's sprite tag (e.g. 'activate' / 'deactivate' of a dice), '' if none. */
    tag: string;

    private wrappedId: number;

    constructor(id: number, data: ILayer) {
        this.wrappedId = id;
        this.ignoreMouse = data.ignoreMouse;
        this.alpha = data.alpha;
        this.z = data.z;
        this.ink = data.ink;
        this.tag = data.tag ?? '';
    }

    get id(): number {
        return this.wrappedId;
    }
}
