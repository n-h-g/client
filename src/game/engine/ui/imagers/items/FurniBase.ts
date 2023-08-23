import { IFurnidata } from '../../../../core/ui/imagers/items/data/IFurnidata'
import * as PIXI from 'pixi.js'
import { IAsset } from '../../../../core/ui/imagers/items/IAsset'
import { ILayer } from '../../../../core/ui/imagers/items/ILayer'
import { fetchJsonAsync } from '../../../../utils/DownloadManager'
import { Engine } from '../../../../Engine'

export default class FurniBase {
    private _data: IFurnidata
    private _spritesheetData: IFurnidata
    private spritesheet: Promise<PIXI.Texture>
    public itemName: string

    constructor(data: IFurnidata, itemName: string) {
        this._data = data
        this._spritesheetData = null
        this.spritesheet = null
        this.itemName = itemName
    }

    public init(): Promise<any> {
        return Promise.all([
            new Promise((res, rej) => {
                let url = Engine.getInstance().config.proxyUrl + Engine.getInstance().config.itemsResourcesUrl + this.itemName + '/' + this.itemName + '.json'
                fetchJsonAsync(url).then(data => {
                    this._spritesheetData = data as IFurnidata
                    //console.log(this._spritesheetData)
                    res(data)
                }).catch(err => {
                    throw new Error('cannot find json file ' + url)
                    rej(err)
                })

            })
        ])
    }

    public downloadSpritesheet(): Promise<PIXI.Texture> {
        let loader = new PIXI.Loader()
        let configUrl = Engine.getInstance().config.proxyUrl + Engine.getInstance().config.itemsResourcesUrl + this.itemName + '/' + this.itemName + '.png'

        loader.add(configUrl)

        if (this.spritesheet != undefined) {
            return Promise.resolve(this.spritesheet)
        }

        let texture: Promise<PIXI.Texture> = new Promise((resolve, reject) => {

            loader.load((loader: PIXI.Loader) => {
                let texture = PIXI.Texture.from(loader.resources[configUrl].data)
                resolve(texture)
            })
        })

        this.spritesheet = texture

        return texture
    }

    public getBlendModeFromInk(blendMode: string) {
        switch(blendMode){
            case 'ADD':
                return PIXI.BLEND_MODES.ADD
            case 'COPY':
            case '':
                return PIXI.BLEND_MODES.COLOR
        }
    }

    public updateSpriteFrom(sprite: PIXI.Sprite, layer: ILayer): PIXI.Sprite {
        if (layer) {
            if (layer.ink) {
                sprite.blendMode = this.getBlendModeFromInk(layer.ink)
            }
            if (layer.z) {
                sprite.zIndex = layer.z
            }
            if(layer.alpha) {
                sprite.alpha = layer.alpha
            }

            if(layer.ignoreMouse) {
                sprite.buttonMode = false
            }
        }
        return sprite
    }

    public getAvailableDirections(): number[] {
        const directions: number[] = []
        const rawDirections = this.directions

        for (let direction in rawDirections) {
            directions.push(parseInt(direction))
        }
        

        return directions
    }


    public hasDirection(direction: number): boolean {
        direction = direction / 90 * 2
        return this.data.visualization.directions!.indexOf(direction) >= 0
    }

    public hasAnimations(): boolean {
        return this.data.visualization.animations != null
    }

    public hasAnimation(animation: number): boolean {
        return this.hasAnimations() && this.data.visualization.animations![animation] != null
    }

    public hasAnimationForLayer(animation: number, layer: number): boolean {
        return this.hasAnimation(animation) && this.data.visualization.animations![animation].layers[layer] != null
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

    public getSprite(texture: PIXI.Texture, framePart: IAsset): PIXI.Sprite {
        if (!framePart.sprite) {
            return
        }

        texture = new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(framePart.sprite.left, framePart.sprite.top, framePart.sprite.width, framePart.sprite.height))
        let sprite = new PIXI.Sprite(texture)
        return sprite
    }

    public getFrameFrom(animation: number, layer: number, frameCount: number): number {
        if (this.hasAnimationForLayer(animation, layer)) {
            let animationLayer = this.data.visualization.animations![animation].layers[layer]

            if (animationLayer.frameSequences == null || (animationLayer.frameSequences as []).length < 1) {
                return 0
            }

            let frameRepeat = animationLayer.frameRepeat || 1

            let frameIndex = Math.floor((frameCount % (Object.keys(animationLayer.frameSequences[0].frames).length * frameRepeat)) / frameRepeat)

            return animationLayer.frameSequences[0].frames[Object.keys(animationLayer.frameSequences[0].frames)[frameIndex]].id
        }

        return 0
    }

    public hasColors(): boolean {
        return this.data.visualization.colors != null
    }

    public hasColor(color: number): boolean {
        return this.hasColors() &&
            this.data.visualization.colors![color] != null
    }

    public hasColorForLayer(color: number, layer: number): boolean {
        return this.hasColor(color) &&
            this.data.visualization.colors![color].layers[layer] != null
    }

    public getColorFrom(color: number, layer: number): number {
        if (this.hasColorForLayer(color, layer)) {
            return this.data.visualization.colors![color].layers[layer].color
        }

        return 0xFFFFFF
    }

    public getColors(): string[] {
        return Object.keys(this.data.visualization.colors!)
    }

    private layerFromNumber(layer: number): string {
        return String.fromCharCode(layer + 97) // a
    }

    public assetNameFrom(size: number | string, layer: number, direction?: number, frame?: number): string {
        let layerChar = this.layerFromNumber(layer)

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
        return this.data.assets[assetName] != null
    }

    public hasLayers(): boolean {
        return this.data.visualization.layers != null
    }

    public hasLayer(layer: number): boolean {
        return this.hasLayers() &&
            this.data.visualization.layers![layer] != null
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
    public get layercount() {
        return this.data.visualization.layerCount
    }

    public get angle(): number {
        return this.data.visualization.angle
    }

    public get directions(): number[] {
        return this.data.logic.directions!.map((direction) => direction / 90 * 2)
    }
}