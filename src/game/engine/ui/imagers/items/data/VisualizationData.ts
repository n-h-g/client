import {IAnimation} from '../../../../../core/ui/imagers/items/IAnimation';
import {IColor} from '../../../../../core/ui/imagers/items/IColor';
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
    static MAX_LAYERS = 26;

    private wrappedLayerCount: number;

    private wrappedAngle: number;

    private wrappedColors: Map<number, ColorData>;

    private wrappedDirections: Map<number, DirectionData>;

    private wrappedAnimations: Map<number, AnimationData>;

    private wrappedLayers: Map<number, Layer>;

    constructor(data: IVisualization) {
        this.wrappedLayerCount = data.layerCount;

        this.wrappedAngle = data.angle < 1 ? 1 : data.angle > 360 ? 360 : data.angle;

        this.wrappedColors = new Map();

        this.wrappedAnimations = new Map();
        this.wrappedLayers = new Map();
        this.wrappedDirections = new Map();

        this.loadLayers(data.layers);
        this.loadColors(data.colors);
        this.loadDirections(data.directions);
        this.loadAnimations(data.animations)
    }

    getAnimationLayer(layerId, animationId) {
        const animation = this.wrappedAnimations.get(animationId);

        if (!animation) return;

        const layer = animation.getLayer(layerId);

        return layer;
    }

    getLayer(layerId: number) {
        if (!this.wrappedLayers) return;

        const layer = this.wrappedLayers.get(layerId);

        return layer;
    }

    getValidDirection(direction: number) {
        const existing = this.hasDirection(direction);

        if (existing) return direction;

        direction = ((direction % 360) + 360) % 360;

        let currentAngle = -1;
        let validDirection = -1;

        for (const key of this.wrappedDirections.keys()) {
            let angle = (key * this.wrappedAngle - direction + 360) % 360;

            if (angle > 180) angle = 360 - angle;

            if (angle < currentAngle || currentAngle < 0) {
                currentAngle = angle;
                validDirection = key;
            }
        }

        if (validDirection >= 0) return Math.trunc(validDirection);

        return 0;
    }

    hasLayers() {
        return this.wrappedLayers.size > 0;
    }

    hasAnimationForLayer(animation: number, layer: number): boolean {
        const data = this.wrappedAnimations.get(animation)

        if (!animation) return false;
        const layerData = data.getLayer(layer)

        return this.hasAnimation(animation) && layerData != null;
    }

    hasColors(): boolean {
        return this.wrappedColors != null && this.wrappedColors.size > 0;
    }

    hasColor(color: number): boolean {
        return this.hasColors() && this.wrappedColors![color] != null;
    }

    getColor(colorId: number, layerId): ColorData {
        return this.wrappedColors[colorId];
    }

    getDirection(number: number): DirectionData {
        const direction = this.wrappedDirections.get(number);

        if (!direction) return null;

        return direction;
    }

    hasAnimation(animation: number): boolean {
        return this.hasAnimations() && this.wrappedAnimations.get(animation) != null;
    }

    hasAnimations(): boolean {
        return this.wrappedAnimations != null && this.wrappedAnimations.size > 0;
    }

    hasDirection(direction: number): boolean {
        direction = (direction / 90) * 2;
        return this.wrappedDirections.has(direction);
    }

    loadLayers(layers: {[key: string]: ILayer}) {
        for (let layer of Object.keys(layers)) {
            this.wrappedLayers.set(
                parseInt(layer),
                new Layer(parseInt(layer), layers[layer])
            );
        }
    }

    loadAnimations(animations: {[key: string]: IAnimation}) {
        for (let animation of Object.keys(animations)) {
            this.wrappedAnimations.set(
                parseInt(animation),
                new AnimationData(parseInt(animation), animations[animation])
            );
        }
    };

    loadDirections(directions: {[key: string]: IDirection}) {
        for (let direction of Object.keys(directions)) {
            this.wrappedDirections.set(
                parseInt(direction),
                new DirectionData(parseInt(direction), directions[direction])
            );
        }
    }

    loadColors(colors: {[key: string]: IColor}) {
        for (let color of Object.keys(colors)) {
            this.wrappedColors.set(parseInt(color), new ColorData(colors[color]));
        }
    }

    getColors(): string[] {
        return Object.keys(this.wrappedColors);
    }

    get directions(): Map<number, DirectionData> {
        return this.wrappedDirections;
    }
    get layerCount(): number {
        return this.wrappedLayerCount;
    }
}
