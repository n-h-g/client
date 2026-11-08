export interface ILayer {
    x?: number;
    y?: number;
    z?: number;
    alpha?: number;
    ink?: string;
    ignoreMouse?: boolean;
    /** What a click on the layer does, e.g. 'activate' / 'deactivate' of a dice (Nitro's sprite tag). */
    tag?: string;
}
