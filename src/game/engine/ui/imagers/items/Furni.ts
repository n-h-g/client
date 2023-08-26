import { Container, Rectangle, Sprite, Texture } from "pixi.js";
import FurniBase from "./FurniBase";
import { FurniData } from "./FurniData";
import { FurniAsset } from "./FurniAsset";
import { IOffsets } from "../../../../core/ui/imagers/items/IAsset";
import { Layer } from "./data/Layer";
import { FurniSpriteUtils } from "./utils/FurniSpriteUtils";
import FurniEvents from "./events/FurniEvents";
import { Engine } from "../../../../Engine";
import { RoomVisualizationType } from "../../../../core/room/object/RoomVisualizationType";
import { Logger } from "../../../../utils/Logger";
import RenderingUtils from "../../../../utils/RenderingUtils";

export class Furni {

    private _furniBase: FurniBase

    private _direction: number = 0

    private _animation: number = 0

    private _textureCache: Texture

    private _container: Container;

    private _isIcon: boolean;
    
    private _frame: number = 0;

    private _isPlaying: boolean = false;

    private _events: FurniEvents;

    private _isPlaceholder: boolean;

    private _multiplier: number = 1

    private _lastAnimation: number = 1
    
    public constructor(furniBase: FurniBase, direction: number = 0, animation: number = 0, frame: number = 0, isIcon: boolean = false, isPlaceholder: boolean = false) {
        this._furniBase = furniBase
        this._direction = direction;
        this._animation = animation;
        this._isIcon = isIcon;
        this._frame = frame;

        this._multiplier = 1

        this._lastAnimation = 1

        this._isPlaceholder = isPlaceholder;

        this._events = new FurniEvents()
        this._container = new Container()

        this._container.interactive = true
        this._container.visible = true
        this._container.sortableChildren = true
    }

    public async init() {
        return new Promise<void>((res, rej)  => {
            if(Engine.getInstance().userInterfaceManager.furniImager.hasTexture(this._furniBase.itemName)) {
                this._textureCache = Engine.getInstance().userInterfaceManager.furniImager.getTexture(this._furniBase.itemName)
            } else {
                this._furniBase.downloadSpritesheet().then(async (texture) => { 
                    this._textureCache = texture as Texture
                    Engine.getInstance().userInterfaceManager.furniImager.addTexture(this._furniBase.itemName, texture)
                    res()
                })
            }
        })
    }

    public update(needsUpdate: boolean = false) {

        this._isPlaying = true;

        if(this._animation == this._lastAnimation) needsUpdate = false;

        this.updateSprites(true, 1)

        if (this.furniBase.visualizationType !== RoomVisualizationType.FURNITURE_ANIMATED) {
            this._isPlaying = false
        }

        this._events.onSpriteCreated()
    }

    public reset() {
        this._animation = 0;
        this._direction = 0;
        this._frame = 0;
        this._lastAnimation = 0;

        this.container.removeChildren()
    }

    private updateSprites(needsUpdate: boolean = false, animation: number = 0) {
        for (let layer = 0; layer < this._furniBase.getLayerCount(); layer++) {
            this.updateSprite(layer)
        }

        this._lastAnimation = animation;
    }

    private updateSprite(layer: number) {

        const direction = this._furniBase.getValidDirection(this._direction)

        const frame = this._isIcon
          ? 0
          : this._furniBase.getFrameFrom(
              direction,
              this._animation,
              layer,
              this._frame
            );

        let assetName = this._furniBase.assetNameFrom(
          this._isIcon ? 1 : FurniData.DEFAULT_SIZE,
          this._isIcon ? 0 : layer,
          direction,
          frame
        );

        if(!assetName) {
            Logger.debug("Unable to generate assetname");
            return;
        }

        let asset: FurniAsset = this._furniBase.getAsset(assetName)

        if(!asset) {
            Logger.debug("No assets found");
            return;
        }


        if(!asset.sprite) asset = this._furniBase.getAsset(asset.source)

        let sprite = this.getSprite(asset)
        if (asset.isFlipped()) {
            sprite.scale.x = -1
          }

          let offsets: IOffsets = asset._offsets

          if (!sprite) return

          sprite.pivot.x = offsets.left
          sprite.pivot.y = offsets.top

          if (!this._furniBase.getLayers()) return; 
        
            sprite = this.updateSpriteFrom(
                sprite,
                this._direction,
                this._furniBase.getLayer(layer)
            )
          
          this._container.addChild(sprite)
    }

    private getSprite(asset: FurniAsset): Sprite {
        if (!asset.sprite) {
            return
        }

        let texture;

        if(Engine.getInstance().userInterfaceManager.furniImager.hasTexture(asset.name)) {
            texture = Engine.getInstance().userInterfaceManager.furniImager.getTexture(asset.name)
        } else {   
            texture = RenderingUtils.cropTexture(this._textureCache, asset.sprite.height, asset.sprite.width, asset.sprite.left, asset.sprite.top)


            Engine.getInstance().userInterfaceManager.furniImager.addTexture(asset.name, texture)
        }

   
        let sprite = new Sprite(texture)


        return sprite
    }

    private updateSpriteFrom(sprite: Sprite, direction: number, layer: Layer): Sprite {
        if (layer) {
            sprite.visible = true

            if (layer.ink) {
                sprite.blendMode = FurniSpriteUtils.getBlendModeFromInk(layer.ink)
            }
            if (layer.z) {
                sprite.zIndex = layer.z
            }
            if(layer.alpha) {
                sprite.alpha = (layer.alpha / 255) * this._multiplier
            }
            if(layer.ignoreMouse) {
                sprite.buttonMode = false
            }
        } else {
            sprite.alpha = FurniData.DEFAULT_ALPHA / 255 * this._multiplier
        }
        return sprite
    }

    public getNextDirection(direction: number) {
        const directions = this._furniBase.getAvailableDirections()
        const pos = directions.indexOf(direction)
        return directions[(pos + 1) % directions.length]
    }

    public setIcon(icon: boolean) {
        this._isIcon = icon;
    }

    public get furniBase() {
        return this._furniBase;
    }

    public setPlaceHolder(placeholder: boolean) {
        this._isPlaceholder = placeholder;
    }

    public setDirection(direction) {
        this._direction = direction;
    }

    public updateObject() {

    }
    
    public get container() {
        return this._container;
    }
}