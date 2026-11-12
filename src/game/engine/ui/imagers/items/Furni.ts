import { BLEND_MODES, Container, IPointData, Sprite, Texture } from 'pixi.js';
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
import { AlphaHitTest } from './utils/AlphaHitTest';
import { RoomDepth } from '../../../room/visualization/RoomDepth';

/** The downloaded image of a room background or a billboard (see Furni.setBrandedImage). */
export interface BrandedImage {
	texture: Texture;
	offsetX: number;
	offsetY: number;
	/** Added to the depth of the layer among the layers of the furni (a billboard, Nitro's FurnitureBBVisualization). */
	offsetZ: number;
	/** 0 as it is, 1 flipped horizontally, 2 both, 3 vertically. */
	state: number;
	/**
	 * Where the image goes: 'direction' from the furni origin towards its direction (a room background, Nitro's
	 * FurnitureRoomBackgroundVisualization), 'layer' at the offset of the layer (a billboard).
	 */
	anchor: 'direction' | 'layer';
}

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

	/**
	 * The layers drawn in front of the avatars that are on the furni (e.g. the front of a bath with an avatar
	 * sitting in it): a furni container has only one zIndex, these layers need one above the avatars.
	 * ItemVisualization puts it in the room next to the furni container.
	 */
	readonly frontContainer = new Container();
	private frontLayers = new Set<number>();

	/** Color variant of the furni: the number after the * in the name (chair_plasto*2 -> 2), 0 = default. */
	colorId = 0;

	/** Nitro's tag of the layer that shows a downloaded image (a room background, see setBrandedImage). */
	static readonly BRANDED_IMAGE = 'branded_image';

	/** The image shown by the layers tagged branded_image instead of their asset, null for the asset. */
	private brandedImage: BrandedImage | null = null;

	/**
	 * The downloaded image of a room background or a billboard (Nitro's FurnitureBrandedImageVisualization): it
	 * replaces the asset of the branded_image layer. Null shows the asset again (no image, or not loaded).
	 */
	setBrandedImage(image: BrandedImage | null): void {
		this.brandedImage = image;
		this.update(true);
	}

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
		this.frontContainer.sortableChildren = true;

		//console.log(this.furniBase.LogicType)
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

			placeholder.height = 64 - 10e-3;
			placeholder.width = 64 - 10e-3;

			this.container.addChild(placeholder);
		});
	}

	private updateSprites(needsUpdate = false, animation = 0) {
        if (needsUpdate) {
            this.container.removeChildren();
            this.frontContainer.removeChildren();
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

		if (this.brandedImage && !this.isIcon && layer >= 0
			&& this.wrappedFurniBase.getLayer(layer)?.tag === Furni.BRANDED_IMAGE) {
			this.updateBrandedSprite(layer, direction, this.brandedImage);
			return;
		}
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
			// clickable only on the visible pixels
			AlphaHitTest.apply(sprite);
			this.layerSprites.set(layer, sprite);
			(this.frontLayers.has(layer) ? this.frontContainer : this.container).addChild(sprite);
		} else {
			sprite.texture = texture;
			sprite.visible = true;
		}

		// the offset is always the asset's own: a source only gives the bitmap
		const offsets = originalAsset.offsets ?? currentAsset.offsets;

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

		// color variants (e.g. chair_plasto*2) tint some layers
		sprite.tint = layer >= 0 ? this.wrappedFurniBase.getColorFrom(this.colorId, layer) : 0xffffff;
	}
	/**
	 * The layer with the downloaded image, as Nitro's FurnitureBrandedImageVisualization.addBackgroundAsset:
	 * - a room background (FurnitureRoomBackgroundVisualization): the image goes from the furni origin towards the
	 *   direction (1 up-right, 3 down-right, 5 down-left, 7 up-left, 4 centered);
	 * - a billboard (FurnitureBBVisualization): its top left corner at the offset of the layer;
	 * - moved by the offsets of the furni;
	 * - the state flips it (1 horizontally, 2 both, 3 vertically), in the same place;
	 * - the mouse hits its whole rectangle (no alpha test: a big image, maybe of another site); whether the furni can
	 *   be selected at all is decided by its container (ItemVisualizationRoomBackground).
	 */
	private updateBrandedSprite(layer: number, direction: number, image: BrandedImage) {
		const texture = image.texture;
		const width = texture.width;
		const height = texture.height;

		let sprite = this.layerSprites.get(layer);
		if (!sprite) {
			sprite = new Sprite(texture);
			this.layerSprites.set(layer, sprite);
			(this.frontLayers.has(layer) ? this.frontContainer : this.container).addChild(sprite);
		} else {
			sprite.texture = texture;
			sprite.visible = true;
		}

		const layerData = this.wrappedFurniBase.getLayer(layer);

		// where the top left corner of the image is, from the origin of the furni
		let left: number;
		let top: number;
		if (image.anchor === 'layer') {
			left = layerData?.x ?? 0;
			top = layerData?.y ?? 0;
		} else {
			switch (direction) {
				case 1: left = 0; top = -height; break;
				case 3: left = 0; top = 0; break;
				case 5: left = -width; top = 0; break;
				case 7: left = -width; top = -height; break;
				default: left = -width / 2; top = -height / 2; break;
			}
		}
		left += image.offsetX;
		top += image.offsetY;

		const flipH = image.state === 1 || image.state === 2;
		const flipV = image.state === 2 || image.state === 3;

		// flipped around its pivot: the pivot on the other side keeps the image in the same rectangle
		sprite.scale.set(flipH ? -1 : 1, flipV ? -1 : 1);
		sprite.pivot.set(flipH ? width + left : -left, flipV ? height + top : -top);

		this.updateSpriteFrom(sprite, direction, layerData, layer);
		sprite.zIndex += image.offsetZ;

		sprite.tint = 0xffffff;
		sprite.eventMode = 'static';
		sprite.hitArea = null;
	}

	private allLayersIgnoreMouse(): boolean {
		const count = this.wrappedFurniBase.getLayerCount();
		for (let i = 0; i < count; i++) {
			if (!this.wrappedFurniBase.getLayer(i)?.ignoreMouse) return false;
		}
		return count > 0;
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

			// the z of the direction if it changes it (e.g. hcamme's tap), else the one of the layer.
			// With the same z the layers are drawn in their order (b over a), as in Habbo:
			// e.g. the lights of party_floor (b) were hidden under its floor (a)
			const finalZ = this.wrappedFurniBase.getLayerZ(direction, layerIndex);
			sprite.zIndex = finalZ + (layer.id * 0.001);

			if (layer.alpha !== undefined) {
				sprite.alpha = (layer.alpha / 255) * this.multiplier;
			} else {
				sprite.alpha = 1 * this.multiplier;
			}


			// a furni whose layers all ignore the mouse (e.g. wl_sofa) would not be clickable at all:
			// the flag is used only if some other layer can be clicked
			if (layer.ignoreMouse && !this.allLayersIgnoreMouse()) {
				sprite.eventMode = 'none';
				sprite.cursor = 'default';
			}
		} else {
			if (layerIndex === -1) {
				sprite.alpha = (47 / 255) * this.multiplier;
				sprite.zIndex = directionZ - 100;
				// the shadow is not part of the furni for the mouse
				sprite.eventMode = 'none';
			} else {

				sprite.alpha = (FurniData.DEFAULT_ALPHA / 255) * this.multiplier;
				sprite.zIndex = this.wrappedFurniBase.getLayerZ(direction, layerIndex) + (layerIndex * 0.001);
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

	/**
	 * The tag of the layer under the given point (Nitro's spriteTag of the mouse event, e.g. 'activate' on the dice
	 * and 'deactivate' on its base), '' if the layer on top there has none.
	 * It's found from the point, not from the target of the event: the layers aren't interactive by themselves, so
	 * Pixi gives the furni container (or the front one) as the target.
	 *
	 * @param point the position of the mouse on the screen (the global of the pointer event).
	 */
	getSpriteTagAt(point: IPointData): string {
		let top: {layer: number; front: boolean; zIndex: number} | null = null;

		for (const [layer, sprite] of this.layerSprites) {
			if (layer < 0 || !sprite.worldVisible || sprite.eventMode === 'none' || !sprite.parent) continue;
			if (!sprite.containsPoint(point)) continue;

			// the layers in front of the avatars are drawn over the others
			const front = sprite.parent === this.frontContainer;
			if (!top || (front && !top.front) || (front === top.front && sprite.zIndex >= top.zIndex)) {
				top = {layer, front, zIndex: sprite.zIndex};
			}
		}

		return top ? this.wrappedFurniBase.getLayer(top.layer)?.tag ?? '' : '';
	}

	nextFrame() {
    if (!this.isPlaying || this.isPlaceholder || this.isIcon) return;
		this.frame = (this.frame + 1);
		this.updateSprites(false, this.animation); 
	}

	/** Set an exact animation tick, used by catalogue previews to capture a deterministic loop. */
	setFrame(frame: number) {
		this.frame = Math.max(0, Math.floor(frame));
		this.updateSprites(false, this.animation);
	}

	/**
	 * Depth of each drawn layer from the furni origin (see RoomDepth.ofLayer). The shadow is not included.
	 */
	getLayerDepths(): Map<number, number> {
		const direction = this.wrappedFurniBase.getValidDirection(this.direction);
		const depths = new Map<number, number>();

		for (const layer of this.layerSprites.keys()) {
			if (layer < 0) continue;

			const z = this.wrappedFurniBase.getLayerZ(direction, layer);
			depths.set(layer, RoomDepth.ofLayer(z, layer));
		}

		return depths;
	}

	/** Moves the given layers in the front container, the others back in the furni container. */
	setFrontLayers(layers: Set<number>) {
		if (layers.size === this.frontLayers.size && [...layers].every(layer => this.frontLayers.has(layer))) return;

		this.frontLayers = new Set(layers);

		for (const [layer, sprite] of this.layerSprites) {
			const parent = this.frontLayers.has(layer) ? this.frontContainer : this.container;
			if (sprite.parent !== parent) parent.addChild(sprite);
		}
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
