import { Sprite, Texture } from "pixi.js";
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
import { RoomObjectSprite } from "../../../../core/room/object/RoomObjectSprite";

export class Furni extends RoomObjectSprite {
    private _furniBase: FurniBase
    private _direction: number = 0
    private _animation: number = 0
    private _textureCache: Texture
    private _isIcon: boolean;
    private _frame: number = 0;
    private _isPlaying: boolean = false;
    private _events: FurniEvents;
    private _isPlaceholder: boolean;
    private _multiplier: number = 1
    private _lastAnimation: number = 1

    public constructor(furniBase: FurniBase, direction: number = 0, animation: number = 0, frame: number = 0, isIcon: boolean = false, isPlaceholder: boolean = false) {
        super();

        this._furniBase = furniBase
        this._direction = direction;
        this._animation = animation;
        this._isIcon = isIcon;
        this._frame = frame;

        this._multiplier = 1

        this._lastAnimation = 1

        this._isPlaceholder = isPlaceholder;

        this._events = new FurniEvents()

        this.container.eventMode = 'dynamic'
        this.container.visible = true
        this.container.sortableChildren = true
    }

    public async init(): Promise<void> {
        if (this._isPlaceholder)
            return

        if (Engine.getInstance()?.userInterfaceManager?.furniImager?.hasTexture(this._furniBase.itemName))
            this._textureCache = Engine.getInstance()?.userInterfaceManager?.furniImager?.getTexture(this._furniBase.itemName)
        else {
            const texture: Texture = await this._furniBase.downloadSpritesheet()
            this._textureCache = texture
            Engine.getInstance()?.userInterfaceManager?.furniImager?.addTexture(this._furniBase.itemName, texture)
        }
    }

    public update(needsUpdate: boolean = false) {
        if (this._isPlaceholder) {
            this.loadPlaceHolder();
            return;
        }

        this._isPlaying = true;

        if (this._animation == this._lastAnimation) needsUpdate = false;

        this.updateSprites(true, 1)

        if (this._furniBase.visualizationType !== RoomVisualizationType.FURNITURE_ANIMATED)
            this._isPlaying = false

        this._events.onSpriteCreated()
    }

    private loadPlaceHolder() {
        this.downloadPlaceHolderTexture().then(async (texture: Texture) => {
            this._textureCache = texture
            Engine.getInstance().userInterfaceManager.furniImager.addTexture(this._furniBase ? this._furniBase.itemName : null, texture)

            let placeholder = Sprite.from(this._textureCache)

            placeholder.height = 68 - 10e-3;
            placeholder.width = 68 - 10e-3;

            this.container.addChild(placeholder)
        })
    }

    private updateSprites(needsUpdate: boolean = false, animation: number = 0) {
        for (let layer = 0; layer < this._furniBase.getLayerCount(); layer++) {
            this.updateSprite(layer)
        }

        this._lastAnimation = animation;
    }

    private updateSprite(layer: number) {

        let offsetDirection = (360 - (this._direction + 135));
        offsetDirection = ((((offsetDirection) % 360) + 360) % 360);

        const direction = this._furniBase.getValidDirection(offsetDirection)

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

        if (!assetName) {
            Logger.debug("Unable to generate assetName");
            return;
        }

        let asset: FurniAsset = this._furniBase.getAsset(assetName)
        if (!asset) {
            Logger.debug("No assets found");
            return;
        }


        if (!asset.sprite) asset = this._furniBase.getAsset(asset.source)


        let sprite = this.getSprite(asset)
        if (asset.isFlipped()) {
            sprite.scale.x = -1
        }

        let offsets: IOffsets = asset._offsets

        if (!sprite) return

        sprite.pivot.x = offsets.left
        sprite.pivot.y = offsets.top

        if (!this._furniBase.hasLayers()) return;

        sprite = this.updateSpriteFrom(
            sprite,
            this._direction,
            this._furniBase.getLayer(layer)
        )

        this.container.addChild(sprite)
    }

    private getSprite(asset: FurniAsset): Sprite {
        if (!asset.sprite)
            return

        let texture: Texture;

        if (Engine.getInstance().userInterfaceManager.furniImager.hasTexture(asset.name))
            texture = Engine.getInstance()?.userInterfaceManager?.furniImager?.getTexture(asset.name)
        else {
            texture = RenderingUtils.cropTexture(this._textureCache, asset.sprite.height, asset.sprite.width, asset.sprite.left, asset.sprite.top)
            Engine.getInstance()?.userInterfaceManager?.furniImager?.addTexture(asset.name, texture)
        }

        const sprite = Sprite.from(texture)
        return sprite
    }

    private updateSpriteFrom(sprite: Sprite, direction: number, layer: Layer): Sprite {
        if (layer) {
            sprite.visible = true

            if (layer.ink) {
                sprite.blendMode = FurniSpriteUtils.getBlendModeFromInk(layer.ink)
            }
            if (layer.z) {
                let relativeDepth = this._furniBase.getDirection(direction) != null ? this._furniBase.getDirection(direction).getOffsetZ() : layer.z
                relativeDepth = (relativeDepth - (layer.id * 0.001));
            } else {
                sprite.zIndex = 1 * this._furniBase.getDirection(direction).getOffsetZ()
            }
            if (layer.alpha) {
                sprite.alpha = (layer.alpha / 255) * this._multiplier
            }
            if (layer.ignoreMouse) {
                sprite.cursor = 'default'
            }
        } else {
            sprite.alpha = FurniData.DEFAULT_ALPHA / 255 * this._multiplier
        }
        return sprite
    }

    public downloadPlaceHolderTexture(): Promise<Texture> {
        let configUrl = Engine.getInstance().config.proxyUrl + Engine.getInstance().config.roomResourcesUrl + '/furni_placeholder.png'

        let texture: Promise<Texture> = new Promise((resolve, reject) => {
            try {
                const texture = Texture.from(configUrl)
                resolve(texture)
            } catch (e) {
                throw e;
            }
        })

        return texture
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

}