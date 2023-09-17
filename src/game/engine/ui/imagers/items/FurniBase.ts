import {IFurnidata} from '../../../../core/ui/imagers/items/data/IFurnidata';
import * as PIXI from 'pixi.js';
import {IAsset} from '../../../../core/ui/imagers/items/IAsset';
import {ILayer} from '../../../../core/ui/imagers/items/ILayer';
import {fetchJsonAsync} from '../../../../utils/DownloadManager';
import {Engine} from '../../../../Engine';
import {FurniAsset} from './FurniAsset';
import {VisualizationData} from './data/VisualizationData';
import {LogicData} from './data/LogicData';
import {FurniSpriteUtils} from './utils/FurniSpriteUtils';
import {Layer} from './data/Layer';
import {Repository} from '../../../../core/Repository';

export class FurniBase {
    private _data: IFurnidata;
    private _spritesheetData: IFurnidata;
    private spritesheet: PIXI.Texture;
    itemName: string;
    private _visualizationData: VisualizationData;
    private _logicData: LogicData;
    _assets: Repository<string, FurniAsset>;

    constructor(data: IFurnidata, itemName: string) {
        this._data = data;
        this._spritesheetData = null;
        this._visualizationData = null;
        this._logicData = null;
        this.spritesheet = null;
        this.itemName = itemName;
        this._assets = new Repository();
    }

    async init(): Promise<Repository<string, FurniAsset>> {
        const url =
            Engine.getInstance()?.config?.proxyUrl +
            Engine.getInstance()?.config?.itemsResourcesUrl +
            this.itemName +
            '/' +
            this.itemName +
            '.json';
        const data: IFurnidata = await fetchJsonAsync<IFurnidata>(url);
        if (data != null) {
            this._visualizationData = new VisualizationData(data.visualization);
            this._logicData = new LogicData(data.logic);
            this.loadAssets(data.assets);
        }

        return this._assets;
        /*return Promise.all([
            new Promise((res, rej) => {
                let url = Engine.getInstance().config.proxyUrl + Engine.getInstance().config.itemsResourcesUrl + this.itemName + '/' + this.itemName + '.json'
                fetchJsonAsync(url).then(data => {
                    this._visualizationData = new VisualizationData((data as IFurnidata).visualization)
                    this._logicData = new LogicData((data as IFurnidata).logic)
                    this.loadAssets((data as IFurnidata).assets)
                    res(this._assets)
                }).catch(err => {
                    throw err;
                })
            })
        ])*/
    }

    loadAssets(assets: {[key: string]: IAsset}) {
        if (assets) {
            for (const asset of Object.keys(assets)) {
                this._assets.add(
                    asset,
                    new FurniAsset(asset, assets[asset] as IAsset)
                );
            }
        }
    }

    async downloadSpritesheet(): Promise<PIXI.Texture> {
        const configUrl =
            Engine.getInstance().config.proxyUrl +
            Engine.getInstance().config.itemsResourcesUrl +
            this.itemName +
            '/' +
            this.itemName +
            '.png';

        const texture = await PIXI.Assets.load<PIXI.Texture>(configUrl);

        if (this.spritesheet != undefined) return null;

        this.spritesheet = texture;

        return texture;
    }

    getLogicDimension(dim: number) {
        if (!this._logicData.getDimensions()) return 0;
        return this._logicData.getDimensions()[dim];
    }

    getUIDirection(): number {
        const directions = this.getAvailableDirections();
        let direction = directions[0];

        if (directions.includes(4)) {
            direction = 4;
            return direction;
        }

        if (directions.includes(2)) {
            direction = 2;
            return direction;
        }
        return direction;
    }

    getAvailableDirections(): number[] {
        const directions: number[] = [];
        const rawDirections = this.directions;

        for (const direction in rawDirections) {
            directions.push((parseInt(direction) % 90) * 2);
        }

        return directions;
    }

    hasDirection(direction: number): boolean {
        direction = (direction / 90) * 2;
        return this._visualizationData.hasDirection(direction);
    }

    hasAnimations(): boolean {
        return this._visualizationData.hasAnimations();
    }

    hasAnimation(animation: number): boolean {
        return this._visualizationData.hasAnimation(animation);
    }

    hasAnimationForLayer(animation: number, layer: number): boolean {
        return this._visualizationData.hasAnimationForLayer(animation, layer);
    }

    getAnimations(): string[] {
        return Object.keys(this.data.visualization.animations!);
    }

    getFrameFromAsset(assetName: string): any {
        let frameName = this._spritesheetData!.assets[assetName + '.png'];

        if (frameName == undefined) {
            frameName = this._spritesheetData!.assets[this.itemName + '.png'];
        }

        return frameName;
    }

    getAsset(assetName: string) {
        return this._assets.get(assetName) ?? null;
    }

    getValidDirection(direction: number) {
        return this._visualizationData.getValidDirection(direction);
    }

    getDirection(direction: number) {
        return this._visualizationData.getDirection(direction);
    }

    getFrameFrom(
        direction: number,
        animation: number,
        layer: number,
        frameCount: number
    ): number {
        if (this.hasAnimationForLayer(animation, layer)) {
            const animationLayer = this._visualizationData.getAnimationLayer(
                layer,
                animation
            );

            if (!animationLayer.hasSequences()) {
                return 0;
            }

            const frameRepeat =
                animationLayer.getFrame(direction, frameCount).repeats || 1;

            const frameIndex = Math.floor(
                ((frameCount % animationLayer.getSequence(0).getFrameCount()) *
                    frameRepeat) /
                    frameRepeat
            );

            return animationLayer.getSequence(0).getFrame(frameIndex).id;
        }

        return 0;
    }

    getLayer(layer: number): Layer {
        return this._visualizationData.getLayer(layer);
    }

    hasLayers(): boolean {
        return this._visualizationData.hasLayers();
    }

    hasColorForLayer(color: number, layer: number): boolean {
        return (
            this._visualizationData.hasColor(color) &&
            this.data.visualization.colors![color].layers[layer] != null
        );
    }

    getColorFrom(color: number, layer: number): number {
        if (this.hasColorForLayer(color, layer)) {
            return this._visualizationData.getColor(color, layer).color;
        }

        return 0xffffff;
    }

    getColors(): string[] {
        return this._visualizationData.getColors();
    }

    assetNameFrom(
        size: number | string,
        layer: number,
        direction?: number,
        frame?: number
    ): string {
        const layerChar = FurniSpriteUtils.layerFromNumber(layer);

        if (size == 1) {
            return this.itemName + '_icon_' + layerChar;
        }

        let assetName = this.itemName + '_' + size + '_' + layerChar;

        if (frame != null) {
            assetName += '_' + direction + '_' + frame;
        }

        return assetName;
    }

    private hasAsset(assetName: string) {
        return this._assets.has(assetName);
    }

    hasVisualDirections(): boolean {
        return this.data.visualization.directions != null;
    }

    hasVisualDirection(direction: number): boolean {
        return (
            this.hasVisualDirections() &&
            this.data.logic.directions![direction] != null
        );
    }

    hasVisualDirectionLayer(direction: number, layer: number): boolean {
        if (
            this.hasVisualDirection(direction) &&
            this.data.logic.directions![direction]
        ) {
            return true;
        }

        return false;
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
                return asset.flipH == 1;
            }
        }

        return null;
    }

    get LogicType() {
        return this.data.logicType;
    }

    get visualizationType(): string {
        return this.data.visualization.type;
    }

    getSpriteSheetData() {
        return this._spritesheetData;
    }

    get data() {
        return this._data;
    }

    getLayerCount() {
        return this._visualizationData.layerCount;
    }

    get angle(): number {
        return this.data.visualization.angle;
    }

    get directions(): number[] {
        return this.data.logic.directions!.map(
            direction => (direction / 90) * 2
        );
    }
}
