import {IFurnidata} from '../../../../core/ui/imagers/items/data/IFurnidata';
import * as PIXI from 'pixi.js';
import {IAsset} from '../../../../core/ui/imagers/items/IAsset';
import {fetchJsonAsync} from '../../../../utils/DownloadManager';
import {Engine} from '../../../../Engine';
import {FurniAsset} from './FurniAsset';
import {VisualizationData} from './data/VisualizationData';
import {LogicData} from './data/LogicData';
import {FurniSpriteUtils} from './utils/FurniSpriteUtils';
import {Layer} from './data/Layer';
import {Repository} from '../../../../core/Repository';
import {NitroFurniConverter} from './utils/NitroFurniConverter';

export class FurniBase {
    itemName: string;
    assets: Repository<string, FurniAsset>;

    private spritesheet: PIXI.Texture | null;
    private visualizationData: VisualizationData | null;
    private logicData: LogicData | null;

    constructor(public data: IFurnidata, itemName: string) {
        this.visualizationData = null;
        this.logicData = null;
        this.spritesheet = null;
        this.itemName = itemName;
        this.assets = new Repository();
    }

    async init(): Promise<Repository<string, FurniAsset>> {
        // FurniImager already downloaded the json: download it only if missing
        let downloadedData: unknown = this.data;

        if (downloadedData == null) {
            const url =
                Engine.getInstance()?.config?.proxyUrl +
                Engine.getInstance()?.config?.itemsResourcesUrl +
                this.itemName +
                '/' +
                this.itemName +
                '.json';

            downloadedData = await fetchJsonAsync<unknown>(url);
        }

        if (downloadedData != null) {
            const data: IFurnidata = NitroFurniConverter.isNitro(downloadedData)
                ? NitroFurniConverter.convert(downloadedData)
                : (downloadedData as IFurnidata);

            this.data = data;
            this.visualizationData = new VisualizationData(data.visualization);
            this.logicData = new LogicData(data.logic);
            this.loadAssets(data.assets);
        }

        return this.assets;
    }

    loadAssets(assets: {[key: string]: IAsset}) {
        if (assets) {
            for (const assetName of Object.keys(assets)) {
                this.assets.add(
                    assetName,
                    new FurniAsset(assetName, assets[assetName] as IAsset)
                );
            }
        }
    }

    async downloadSpritesheet(): Promise<PIXI.Texture | null> {
        if (this.spritesheet) return this.spritesheet;

        const configUrl =
            Engine.getInstance().config.proxyUrl +
            Engine.getInstance().config.itemsResourcesUrl +
            this.itemName +
            '/' +
            this.itemName +
            '.png';

        try {
            const texture = await PIXI.Assets.load<PIXI.Texture>({
                src: configUrl,
                data: {
                    premultiplyAlpha: true
                }
            });
            this.spritesheet = texture;
            return texture;
        } catch (error) {
            console.error(`Failed to load spritesheet for ${this.itemName}:`, error);
            return null;
        }
    }
    getLogicDimension(dim: number): number {
        if (!this.logicData || !this.logicData.getDimensions()) return 0;
        return this.logicData.getDimensions()[dim];
    }

    getUIDirection(): number {
        const directions = this.getAvailableDirections();
        if (!directions || directions.length === 0) return 0;

        if (directions.includes(4)) return 4;
        if (directions.includes(2)) return 2;
        
        return directions[0];
    }

    getAvailableDirections(): number[] {
        return this.directions || [];
    }

    hasDirection(direction: number): boolean {
        const normalizedDirection = (direction / 90) * 2;
        return this.visualizationData?.hasDirection(normalizedDirection) ?? false;
    }

    hasAnimations(): boolean {
        return this.visualizationData?.hasAnimations() ?? false;
    }

    hasAnimation(animation: number): boolean {
        return this.visualizationData?.hasAnimation(animation) ?? false;
    }

    hasAnimationForLayer(animation: number, layer: number): boolean {
        return this.visualizationData?.hasAnimationForLayer(animation, layer) ?? false;
    }

    getAnimations(): string[] {
        if (!this.data?.visualization?.animations) return [];
        return Object.keys(this.data.visualization.animations);
    }

    getFrameFromAsset(assetName: string): any {
        if (!this.data || !this.data.assets) return null;

        let frameName = this.data.assets[assetName + '.png'];

        if (frameName === undefined) {
            frameName = this.data.assets[this.itemName + '.png'];
        }

        return frameName;
    }

    getAsset(assetName: string): FurniAsset | null {
        return this.assets.get(assetName) ?? null;
    }

    getValidDirection(direction: number): number {
        return this.visualizationData?.getValidDirection(direction) ?? 0;
    }

    getDirection(direction: number): any {
        return this.visualizationData?.getDirection(direction) ?? null;
    }

    getFrameFrom(direction: number, animation: number, layer: number, frameTick: number): number {
        const animationLayer = this.visualizationData?.getAnimationLayer(layer, animation);
        if (!animationLayer || !animationLayer.hasSequences()) return 0;

        const sequence = animationLayer.getSequence(0);
        if (!sequence) return 0;

        let totalTicks = 0;
        for (let i = 0; i < sequence.getFrameCount(); i++) {
            const frame = sequence.getFrame(i);
            totalTicks += (frame.repeats || 1); 
        }

        const currentTick = frameTick % totalTicks;

        let accumulatedTicks = 0;
        for (let i = 0; i < sequence.getFrameCount(); i++) {
            const frame = sequence.getFrame(i);
            const duration = (frame.repeats || 1);
            
            if (currentTick < (accumulatedTicks + duration)) {
                return frame.id;
            }
            accumulatedTicks += duration;
        }

        return 0;
    }
    getLayer(layer: number): Layer | null {
        return this.visualizationData?.getLayer(layer) ?? null;
    }

    /**
     * The z offset of a layer (the order of the layers and their depth in the room, as Nitro): the one of the
     * direction if the direction changes it (e.g. a layer in front only when the furni is turned), else
     * the one of the layer, else 0.
     * @param direction a valid direction of the furni (see getValidDirection).
     */
    getLayerZ(direction: number, layer: number): number {
        const directionZ = this.getDirection(direction)?.getLayerZ?.(layer);
        if (directionZ !== undefined) return directionZ;

        const z = this.getLayer(layer)?.z;
        return z !== undefined && z !== null ? Number(z) : 0;
    }

    hasLayers(): boolean {
        return this.visualizationData?.hasLayers() ?? false;
    }

    hasColorForLayer(color: number, layer: number): boolean {
        return this.data?.visualization?.colors?.[color]?.layers?.[layer]?.color != null;
    }

    /**
     * The tint of a layer for a color variant (e.g. chair_plasto*2 -> color 2), white if the layer has no color.
     */
    getColorFrom(color: number, layer: number): number {
        if (!this.hasColorForLayer(color, layer)) return 0xffffff;

        const value = this.data.visualization.colors[color].layers[layer].color as number | string;

        return typeof value === 'string' ? parseInt(value.replace('#', ''), 16) : value;
    }

    getColors(): string[] {
        return this.visualizationData?.getColors() ?? [];
    }

    assetNameFrom(
        size: number | string,
        layer: number,
        direction?: number,
        frame?: number
    ): string {
        const layerChar = FurniSpriteUtils.layerFromNumber(layer);

        if (size == 1) {
            return `${this.itemName}_icon_${layerChar}`;
        }

        let assetName = `${this.itemName}_${size}_${layerChar}`;

        if (frame != null) {
            assetName += `_${direction}_${frame}`;
        }

        return assetName;
    }

    private hasAsset(assetName: string): boolean {
        return this.assets.has(assetName);
    }

    hasVisualDirections(): boolean {
        return this.data?.visualization?.directions != null;
    }

    hasVisualDirection(direction: number): boolean {
        return (
            this.hasVisualDirections() &&
            this.data?.logic?.directions?.[direction] != null
        );
    }

    hasVisualDirectionLayer(direction: number, layer: number): boolean {
        return this.hasVisualDirection(direction) && !!this.data.logic.directions![direction];
    }

    isAssetFlipped(
        size: number | string,
        layer: number,
        direction?: number,
        frame?: number
    ): boolean | null {
        const assetName = this.assetNameFrom(size, layer, direction, frame);

        if (this.hasAsset(assetName)) {
            const asset = this.data.assets[assetName];
            if (asset && asset.flipH != null) {
                return asset.flipH === 1;
            }
        }

        return null;
    }

    get LogicType(): string {
        return this.data?.logic.type ?? '';
    }

    get visualizationType(): string {
        return this.data?.visualization?.type ?? '';
    }

    getLayerCount(): number {
        return this.visualizationData?.layerCount ?? 0;
    }

    get angle(): number {
        return this.data?.visualization?.angle ?? 0;
    }

    get directions(): number[] {
        if (!this.data?.logic?.directions) return [];
        return this.data.logic.directions.map(
            (direction: number) => (direction / 90) * 2
        );
    }
    destroy(): void {
        if (this.spritesheet) {
            this.spritesheet.destroy(true);
            this.spritesheet = null;
        }
        
        this.visualizationData = null;
        this.logicData = null;
    }
}