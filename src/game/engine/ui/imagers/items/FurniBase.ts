import { IFurnidata } from '../../../../core/ui/imagers/items/data/IFurnidata'
import * as PIXI from 'pixi.js'
import { IAsset } from '../../../../core/ui/imagers/items/IAsset'
import { ILayer } from '../../../../core/ui/imagers/items/ILayer'
import { fetchJsonAsync } from '../../../../utils/DownloadManager'
import { Engine } from '../../../../Engine'
import { FurniData } from './FurniData'
import { FurniAsset } from './FurniAsset'
import { VisualizationData } from './data/VisualizationData'
import { LogicData } from './data/LogicData'
import { FurniSpriteUtils } from './utils/FurniSpriteUtils'
import { Layer } from './data/Layer'

export default class FurniBase {
    private _data: IFurnidata
    
    private _spritesheetData: IFurnidata

    private spritesheet: Promise<PIXI.Texture>

    public itemName: string

    private _visualizationData: VisualizationData

    private _logicData: LogicData;

    public _assets: Map<string, FurniAsset>

    constructor(data: IFurnidata, itemName: string) {
        this._data = data

        this._spritesheetData = null

        this._visualizationData = null

        this._logicData = null

        this.spritesheet = null

        this.itemName = itemName

        this._assets = new Map()
    }

    public init(): Promise<any> {
        return Promise.all([
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
        ])
    }

    public loadAssets(assets: {[key: string]: IAsset }) {
        if(assets) {
            for(let asset of Object.keys(assets)) {
                this._assets.set(asset, new FurniAsset(asset, (assets[asset] as IAsset)))
            }
        }
    }


    public downloadSpritesheet(): Promise<PIXI.Texture> {
        let configUrl = Engine.getInstance().config.proxyUrl + Engine.getInstance().config.itemsResourcesUrl + this.itemName + '/' + this.itemName + '.png'

        const texture = PIXI.Assets.load(configUrl)

        if (this.spritesheet != undefined)
            return Promise.resolve(this.spritesheet)

        this.spritesheet = texture

        return texture
    }

    public getLogicDimension(dim: number) {

        if(!this._logicData.getDimensions()) return 0;
        return this._logicData.getDimensions()[dim];

    }

    public getUIDirection(): number {
        const directions = this.getAvailableDirections()
        let direction = directions[0]

        if (directions.includes(4)) {
            direction = 4;
            return direction;
        }

        if (directions.includes(2)) {
            direction = 2;
            return direction;
            
        }
        return direction
    }

    public getAvailableDirections(): number[] {
        const directions: number[] = [];
        const rawDirections = this.directions;

        for (let direction in rawDirections) {
            directions.push((parseInt(direction) % 90) * 2)
        }

        return directions;

    }


    public hasDirection(direction: number): boolean {
        direction = direction / 90 * 2
        return this._visualizationData.hasDirection(direction)
    }

    public hasAnimations(): boolean {
        return this._visualizationData.hasAnimations()
    }

    public hasAnimation(animation: number): boolean {
        return this._visualizationData.hasAnimation(animation)
    }

    public hasAnimationForLayer(animation: number, layer: number): boolean {
        return this._visualizationData.hasAnimationForLayer(animation, layer)
    }

    public getAnimations(): string[] {
        return Object.keys(this.data.visualization.animations!)
    }

    public getFrameFromAsset(assetName: string): any {
        console.log(this._spritesheetData)

        let frameName = this._spritesheetData!.assets[assetName + '.png']

        if (frameName == undefined) {
            frameName = this._spritesheetData!.assets[this.itemName + '.png']
        }

        return frameName
    }

    public getAsset(assetName: string) {
        return this._assets.get(assetName) ?? null;
    }

    public getValidDirection(direction: number) {
        return this._visualizationData.getValidDirection(direction)
    }

    public getDirection(direction: number) {
        return this._visualizationData.getDirection(direction)
    }


    public getFrameFrom(direction: number, animation: number, layer: number, frameCount: number): number {
        if (this.hasAnimationForLayer(animation, layer)) {
            let animationLayer = this._visualizationData.getAnimationLayer(layer, animation)

            if (!animationLayer.hasSequences()) {
                return 0
            }

            let frameRepeat = animationLayer.getFrame(direction, frameCount).repeats || 1

            let frameIndex = Math.floor((frameCount % animationLayer.getSequence(0).getFrameCount() * frameRepeat) / frameRepeat)

            return animationLayer.getSequence(0).getFrame(frameIndex).id
        }

        return 0;
    }


    public getLayer(layer: number): Layer {
        return this._visualizationData.getLayer(layer)
    }

    public hasLayers(): boolean {
        return this._visualizationData.hasLayers()
    }



    public hasColorForLayer(color: number, layer: number): boolean {
        return this._visualizationData.hasColor(color) &&
            this.data.visualization.colors![color].layers[layer] != null
    }

    public getColorFrom(color: number, layer: number): number {
        if (this.hasColorForLayer(color, layer)) {
            return this._visualizationData.getColor(color, layer).color
        }

        return 0xFFFFFF
    }

    public getColors(): string[] {
        return this._visualizationData.getColors()
    }

    public assetNameFrom(size: number | string, layer: number, direction?: number, frame?: number): string {
        let layerChar = FurniSpriteUtils.layerFromNumber(layer)

        if (size == 1) {
            return this.itemName + '_icon_' + layerChar
        }

        let assetName = this.itemName + '_' + size + '_' + layerChar

        if (frame != null) {
            assetName += '_' + direction + '_' + frame
        }

        return assetName
    }

    private hasAsset(assetName: string) {
        return this._assets.has(assetName)
    }

    public hasVisualDirections(): boolean {
        return this.data.visualization.directions != null
    }

    public hasVisualDirection(direction: number): boolean {
        return this.hasVisualDirections() &&
            this.data.logic.directions![direction] != null
    }

    public hasVisualDirectionLayer(direction: number, layer: number): boolean {
        if (this.hasVisualDirection(direction) && this.data.logic.directions![direction]) {
            return true
        }

        return false
    }

    public isAssetFlipped(size: number | string, layer: number, direction?: number, frame?: number): boolean | null {
        let assetName = this.assetNameFrom(size, layer, direction, frame)

        if (this.hasAsset(assetName)) {
            let asset = this.data.assets[assetName]
            if (asset && asset.flipH != null) {
                return asset.flipH == 1
            }
        }

        return null
    }

    public get LogicType() {
        return this.data.logicType
    }

    public get visualizationType(): string {
        return this.data.visualization.type
    }

    public getSpriteSheetData() {
        return this._spritesheetData
    }

    public get data() {
        return this._data
    }
    public getLayerCount() {
        return this._visualizationData.layerCount
    }

    public get angle(): number {
        return this.data.visualization.angle
    }

    public get directions(): number[] {

        return this.data.logic.directions!.map((direction) => direction / 90 * 2)
    }
}