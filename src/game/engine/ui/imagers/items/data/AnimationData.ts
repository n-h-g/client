import {IAnimation} from '../../../../../core/ui/imagers/items/IAnimation';
import {IAnimationLayer} from '../../../../../core/ui/imagers/items/IAnimationLayer';
import {ILayer} from '../../../../../core/ui/imagers/items/ILayer';
import {AnimationFrame} from './AnimationFrame';
import {AnimationLayer} from './AnimationLayer';

export class AnimationData {
    private _layers: Map<number, AnimationLayer>;

    static DEFAULT_FRAME_NUMBER = 0;

    private static frameCount = -1;

    private _animationId = -1;

    constructor(animation: number, animationData: IAnimation) {
        this._animationId = animation;
        this._layers = new Map();

        this.loadLayers(animationData.layers);
    }

    hasLayers() {}

    getLayer(layer: number) {
        return this._layers.get(layer);
    }

    private loadLayers(layers: {[key: string]: IAnimationLayer}) {
        for (const layer of Object.keys(layers)) {
            this._layers.set(
                parseInt(layer),
                new AnimationLayer(layers[layer])
            );
        }
    }

    getFrame(
        direction: number,
        layerId: number,
        frameCount: number
    ): AnimationFrame {
        const layer = this._layers.get(layerId);

        if (!layer) return null;

        return layer.getFrame(direction, frameCount);
    }
}
