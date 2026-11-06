import {IDirection} from '../../../../../core/ui/imagers/items/IVisualization';

export class DirectionData {
    private direction = 0;

    private z = 0;

    /** Layer z offsets of this direction only (e.g. a layer in front only when the furni is turned). */
    private layerZ = new Map<number, number>();

    static USE_DEFAULT_DIRECTION = -1;

    constructor(direction: number, data: IDirection) {
        this.direction = direction;

        const layers = (data as {layers?: Record<string, {z?: number}>})?.layers ?? {};

        for (const [layerId, layer] of Object.entries(layers)) {
            if (layer?.z !== undefined) this.layerZ.set(Number(layerId), Number(layer.z));
        }
    }

    getOffsetZ(): number {
        return this.z;
    }

    /** @returns the z offset of the layer for this direction, undefined if the direction doesn't change it. */
    getLayerZ(layerId: number): number | undefined {
        return this.layerZ.get(layerId);
    }
}
