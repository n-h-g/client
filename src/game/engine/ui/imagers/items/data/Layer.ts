import {ILayer} from '../../../../../core/ui/imagers/items/ILayer';

export class Layer {
    /** Nitro's offset of the layer (e.g. where the image of a billboard goes), 0 if none. */
    x: number;
    y: number;
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
        this.x = data.x ?? 0;
        this.y = data.y ?? 0;
        this.z = data.z;
        this.ink = data.ink;
        this.tag = data.tag ?? '';
    }

    get id(): number {
        return this.wrappedId;
    }
}
