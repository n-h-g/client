import { BLEND_MODES, Sprite, Texture } from 'pixi.js';
import { FurniBase } from './FurniBase';
import { FurniData } from './FurniData';
import { FurniAsset } from './FurniAsset';
import { IOffsets } from '../../../../core/ui/imagers/items/IAsset';
import { Layer } from './data/Layer';
import { FurniSpriteUtils } from './utils/FurniSpriteUtils';
import { FurniEvents } from './events/FurniEvents';
import { Engine } from '../../../../Engine';
import { RoomVisualizationType } from '../../../../core/room/object/RoomVisualizationType';
import { Logger } from '../../../../utils/Logger';
import { RenderingUtils } from '../../../../utils/RenderingUtils';
import { RoomObjectSprite } from '../../../../core/room/object/RoomObjectSprite';

export class Furni extends RoomObjectSprite {
	private wrappedFurniBase: FurniBase;
	private direction = 0;
	private animation = 0;
	private textureCache: Texture;
	private isIcon: boolean;
	private frame = 0;
	private isPlaying = false;
	private events: FurniEvents;
	private isPlaceholder: boolean;
	private multiplier = 1;
	private lastAnimation = 1;

	private layerSprites: Map<number, Sprite> = new Map();

	constructor(
		furniBase: FurniBase,
		direction = 0,
		animation = 0,
		frame = 0,
		isIcon = false,
		isPlaceholder = false
	) {
		super();

		this.wrappedFurniBase = furniBase;
		this.direction = direction;
		this.animation = animation;
		this.isIcon = isIcon;
		this.frame = frame;

		this.multiplier = 1;

		this.lastAnimation = 0;

		this.isPlaceholder = isPlaceholder;

		this.events = new FurniEvents();

		this.container.eventMode = 'dynamic';
		this.container.visible = true;
		this.container.sortableChildren = true;
	}

	async init(): Promise<void> {
		if (this.isPlaceholder) return;

		if (
			Engine.getInstance()?.userInterfaceManager?.furniImager?.hasTexture(
				this.wrappedFurniBase.itemName
			)
		)
			this.textureCache =
				Engine.getInstance()?.userInterfaceManager?.furniImager?.getTexture(
					this.wrappedFurniBase.itemName
				);
		else {
			const texture: Texture =
				await this.wrappedFurniBase.downloadSpritesheet();
			this.textureCache = texture;
			Engine.getInstance()?.userInterfaceManager?.furniImager?.addTexture(
				this.wrappedFurniBase.itemName,
				texture
			);
		}
	}

	update(needsUpdate = false) {
        if (this.isPlaceholder) {
            this.loadPlaceHolder();
            return;
        }

        this.isPlaying = true;

        if (this.animation !== this.lastAnimation) {
            needsUpdate = true;
        }

        this.updateSprites(needsUpdate, this.animation);

        if (this.wrappedFurniBase.visualizationType !== RoomVisualizationType.FURNITURE_ANIMATED) {
            this.isPlaying = false;
        }

        this.events.onSpriteCreated();
    }

	private loadPlaceHolder() {
		this.downloadPlaceHolderTexture().then(async (texture: Texture) => {
			this.textureCache = texture;
			Engine.getInstance().userInterfaceManager.furniImager.addTexture(
				this.wrappedFurniBase ? this.wrappedFurniBase.itemName : null,
				texture
			);

			const placeholder = Sprite.from(this.textureCache);

			placeholder.height = 68 - 10e-3;
			placeholder.width = 68 - 10e-3;

			this.container.addChild(placeholder);
		});
	}

	private updateSprites(needsUpdate = false, animation = 0) {
        if (needsUpdate) {
            this.container.removeChildren();
            this.layerSprites.clear();
        }

        for (let layer = -1; layer < this.wrappedFurniBase.getLayerCount(); layer++) {
            this.updateSprite(layer, needsUpdate);
        }

        this.lastAnimation = animation;
    }

	setAnimation(animationId: number) {
        if (this.animation === animationId) return; 

        this.animation = animationId;

        this.update(true); 
    }

	private updateSprite(layer: number, needsUpdate = false) {

		const direction = this.wrappedFurniBase.getValidDirection(this.direction);
		const frame = this.isIcon ? 0 : this.wrappedFurniBase.getFrameFrom(direction, this.animation, layer, this.frame);

		//console.log(direction)

		const assetName = this.wrappedFurniBase.assetNameFrom(this.isIcon ? 1 : 64, layer, direction, frame);
		const originalAsset: FurniAsset = this.wrappedFurniBase.getAsset(assetName);
		if (!originalAsset) return;

		let isFlipped = originalAsset.isFlipped();
		let currentAsset = originalAsset;
		let iterationLimit = 0;
		
		while ((!currentAsset.sprite || !currentAsset.sprite.width) && currentAsset.source && iterationLimit < 5) {
			const sourceAsset = this.wrappedFurniBase.getAsset(currentAsset.source);
			if (sourceAsset) {

				if (sourceAsset.isFlipped()) isFlipped = !isFlipped;
				currentAsset = sourceAsset;
			}
			iterationLimit++;
		}

		if (!currentAsset?.sprite?.width) return;

		let texture = this.getTexture(currentAsset);
		if (!texture) return;

		let sprite = this.layerSprites.get(layer);
		if (!sprite) {
			sprite = new Sprite(texture);
			this.layerSprites.set(layer, sprite);
			this.container.addChild(sprite);
		} else {
			sprite.texture = texture;
			sprite.visible = true;
		}

		const offsets = currentAsset.offsets;

		if (isFlipped) {
			sprite.scale.x = -1;
			sprite.pivot.x = offsets.left; 
		} else {
			sprite.scale.x = 1;
			sprite.pivot.x = offsets.left;
		}

		sprite.pivot.y = offsets.top;
		
		sprite.pivot.y = offsets.top;

		const layerData = this.wrappedFurniBase.getLayer(layer);
		this.updateSpriteFrom(sprite, direction, layerData, layer);
	}
	private getTexture(asset: FurniAsset): Texture {
        if (!asset.sprite) return null;

        let texture: Texture;

        if (Engine.getInstance().userInterfaceManager.furniImager.hasTexture(asset.name)) {
            texture = Engine.getInstance()?.userInterfaceManager?.furniImager?.getTexture(asset.name);
        } else {
            texture = RenderingUtils.cropTexture(
				this.textureCache,
				asset.sprite.left,   // 1
				asset.sprite.top,    // 2
				asset.sprite.width,  // 3
				asset.sprite.height  // 4
			);
            Engine.getInstance()?.userInterfaceManager?.furniImager?.addTexture(
                asset.name,
                texture
            );
        }

        return texture;
    }
	

	private updateSpriteFrom(
		sprite: Sprite,
		direction: number,
		layer: Layer,
		layerIndex: number
	): Sprite {
		const directionData = this.wrappedFurniBase.getDirection(direction);
		const directionZ = directionData ? directionData.getOffsetZ() : 0;

		sprite.visible = true;

		if (layer) {
			if (layer.ink) {
				sprite.blendMode = FurniSpriteUtils.getBlendModeFromInk(layer.ink);
			}

			let finalZ = layer.z ? Number(layer.z) : directionZ;
			sprite.zIndex = finalZ - (layer.id * 0.001);

			if (layer.alpha !== undefined) {
				sprite.alpha = (layer.alpha / 255) * this.multiplier;
			} else {
				sprite.alpha = 1 * this.multiplier;
			}


			if (layer.ignoreMouse) {
				sprite.eventMode = 'none';
				sprite.cursor = 'default';
			}
		} else {
			if (layerIndex === -1) {
				sprite.alpha = (47 / 255) * this.multiplier;
				sprite.zIndex = directionZ - 100;
			} else {

				sprite.alpha = (FurniData.DEFAULT_ALPHA / 255) * this.multiplier;
				sprite.zIndex = directionZ - (layerIndex * 0.001);
			}

		}

		return sprite;
	}

	downloadPlaceHolderTexture(): Promise<Texture> {
		const configUrl =
			Engine.getInstance().config.proxyUrl +
			Engine.getInstance().config.roomResourcesUrl +
			'/furni_placeholder.png';

		const texture: Promise<Texture> = new Promise((resolve, reject) => {
			try {
				const texture = Texture.from(configUrl);
				resolve(texture);
			} catch (e) {
				throw e;
			}
		});

		return texture;
	}

	getNextDirection(direction: number) {
		const directions = this.wrappedFurniBase.getAvailableDirections();
		const pos = directions.indexOf(direction);
		return directions[(pos + 1) % directions.length];
	}

	nextFrame() {
        if (!this.isPlaying || this.isPlaceholder || this.isIcon) return;
        
        this.frame++;

        this.updateSprites(false, this.animation); 
    }

	setIcon(icon: boolean) {
    if (this.isIcon === icon) return;
		this.isIcon = icon;
		this.update(true);
	}

	get icon(): boolean {
		return this.isIcon;
	}

	get furniBase() {
		return this.wrappedFurniBase;
	}

	setPlaceHolder(placeholder: boolean) {
		this.isPlaceholder = placeholder;
	}

	setDirection(direction) {
		this.direction = direction;
	}
}
