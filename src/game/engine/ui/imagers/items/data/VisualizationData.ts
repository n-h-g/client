import {IAnimation} from '../../../../../core/ui/imagers/items/IAnimation';
import {IColor} from '../../../../../core/ui/imagers/items/IColor';
import {IDirections} from '../../../../../core/ui/imagers/items/IDirections';
import {ILayer} from '../../../../../core/ui/imagers/items/ILayer';
import {
    IDirection,
    IVisualization,
} from '../../../../../core/ui/imagers/items/IVisualization';
import {AnimationData} from './AnimationData';
import {ColorData} from './ColorData';
import {DirectionData} from './DirectionData';
import {Layer} from './Layer';

export class VisualizationData {
    public static MAX_LAYERS = 26;

    private _layerCount: number;

    private _angle: number;

    private _colors: Map<number, ColorData>;

    private _directions: Map<number, DirectionData>;

    private _animations: Map<number, AnimationData>;

    private _layers: Map<number, Layer>;

    public constructor(data: IVisualization) {
        this._layerCount = data.layerCount;

        this._angle = data.angle < 1 ? 1 : data.angle > 360 ? 360 : data.angle;

        this._colors = new Map();

        this._animations = new Map();
        this._layers = new Map();
        this._directions = new Map();

        this.loadLayers(data.layers);
        this.loadColors(data.colors);
        this.loadDirections(data.directions);
        this.loadAnimations(data.animations)
    }

    public getAnimationLayer(layerId, animationId) {
        const animation = this._animations.get(animationId);

        if (!animation) return;

        const layer = animation.getLayer(layerId);

        return layer;
    }

    public getLayer(layerId: number) {
        if (!this._layers) return;

        const layer = this._layers.get(layerId);

        return layer;
    }

    public getValidDirection(direction: number) {
        const existing = this.hasDirection(direction);

        if (existing) return direction;

        direction = ((direction % 360) + 360) % 360;

        let currentAngle = -1;
        let validDirection = -1;

        for (const key of this.getDirections().keys()) {
            let angle = (key * this._angle - direction + 360) % 360;

            if (angle > 180) angle = 360 - angle;

            if (angle < currentAngle || currentAngle < 0) {
                currentAngle = angle;
                validDirection = key;
            }
        }

        if (validDirection >= 0) return Math.trunc(validDirection);

        return 0;
    }

    public hasLayers() {
        return this._layers.size > 0;
    }

    public hasAnimationForLayer(animation: number, layer: number): boolean {
        const data = this._animations.get(animation)

        if (!animation) return false;
        const layerData = data.getLayer(layer)

        return this.hasAnimation(animation) && layerData != null;
    }

    public hasColors(): boolean {
        return this._colors != null && this._colors.size > 0;
    }

    public hasColor(color: number): boolean {
        return this.hasColors() && this._colors![color] != null;
    }

    public getColor(colorId, layerId): ColorData {
        const color = this._colors[colorId];

        return color;
    }

    public getDirection(number): DirectionData {
        const direction = this._directions.get(number);

        if (!direction) return null;

        return direction;
    }

    public hasAnimation(animation: number): boolean {
        return this.hasAnimations() && this._animations.get(animation) != null;
    }

    public hasAnimations(): boolean {
        return this._animations != null && this._animations.size > 0;
    }

    public hasDirection(direction: number): boolean {
        direction = (direction / 90) * 2;
        return this._directions.has(direction);
    }

    public loadLayers(layers: {[key: string]: ILayer}) {
        for (let layer of Object.keys(layers)) {
            this._layers.set(
                parseInt(layer),
                new Layer(parseInt(layer), layers[layer])
            );
        }
    }

    public loadAnimations(animations: {[key: string]: IAnimation}) {
        for (let animation of Object.keys(animations)) {
            this._animations.set(
                parseInt(animation),
                new AnimationData(parseInt(animation), animations[animation])
            );
        }

    public loadDirections(directions: {[key: string]: IDirection}) {
        for (let direction of Object.keys(directions)) {
            this._directions.set(
                parseInt(direction),
                new DirectionData(parseInt(direction), directions[direction])
            );
        }

    public loadColors(colors: {[key: string]: IColor}) {
        for (let color of Object.keys(colors)) {
            this._colors.set(parseInt(color), new ColorData(colors[color]));
        }
    }

    public getColors(): string[] {
        return Object.keys(this._colors);
    }

    public getDirections(): Map<number, DirectionData> {
        return this._directions;
    }
    public get layerCount(): number {
        return this._layerCount;
    }
}
