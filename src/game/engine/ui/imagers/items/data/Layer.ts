import {ILayer} from '../../../../../core/ui/imagers/items/ILayer';

export class Layer {
    private _z: number;

    private _alpha: number;

    private _ignoreMouse: boolean;

    private _ink: string;

    private _id: number;

    constructor(id: number, data: ILayer) {
        this._id = id;
        this._ignoreMouse = data.ignoreMouse;
        this._alpha = data.alpha;
        this._z = data.z;
        this._ink = data.ink;
    }

    /**
     * Getter alpha
     * @return {number}
     */
    get alpha(): number {
        return this._alpha;
    }

    /**
     * Setter alpha
     * @param {number} value
     */
    set alpha(value: number) {
        this._alpha = value;
    }

    /**
     * Getter z
     * @return {number}
     */
    get z(): number {
        return this._z;
    }

    /**
     * Setter z
     * @param {number} value
     */
    set z(value: number) {
        this._z = value;
    }

    /**
     * Getter ignoreMouse
     * @return {boolean}
     */
    get ignoreMouse(): boolean {
        return this._ignoreMouse;
    }

    /**
     * Getter ink
     * @return {string}
     */
    get ink(): string {
        return this._ink;
    }

    /**
     * Setter ignoreMouse
     * @param {boolean} value
     */
    set ignoreMouse(value: boolean) {
        this._ignoreMouse = value;
    }

    /**
     * Setter ink
     * @param {string} value
     */
    set ink(value: string) {
        this._ink = value;
    }

    get id(): number {
        return this._id;
    }
}
