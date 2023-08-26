import { ILayer } from "../../../../../core/ui/imagers/items/ILayer";

export class Layer {

    private _z: number;

    private _alpha: number;

    private _ignoreMouse: boolean;

    private _ink: string;

    public constructor(data: ILayer) {
        this._ignoreMouse = data.ignoreMouse;
        this._alpha = data.alpha;
        this._z = data.z;
        this._ink = data.ink
    }


    /**
     * Getter alpha
     * @return {number}
     */
	public get alpha(): number {
		return this._alpha;
	}

    /**
     * Setter alpha
     * @param {number} value
     */
	public set alpha(value: number) {
		this._alpha = value;
	}

    /**
     * Getter z
     * @return {number}
     */
	public get z(): number {
		return this._z;
	}

    /**
     * Setter z
     * @param {number} value
     */
	public set z(value: number) {
		this._z = value;
	}


    /**
     * Getter ignoreMouse
     * @return {boolean}
     */
	public get ignoreMouse(): boolean {
		return this._ignoreMouse;
	}

    /**
     * Getter ink
     * @return {string}
     */
	public get ink(): string {
		return this._ink;
	}

    /**
     * Setter ignoreMouse
     * @param {boolean} value
     */
	public set ignoreMouse(value: boolean) {
		this._ignoreMouse = value;
	}

    /**
     * Setter ink
     * @param {string} value
     */
	public set ink(value: string) {
		this._ink = value;
	}

}