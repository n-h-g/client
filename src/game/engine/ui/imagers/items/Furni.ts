import { Sprite, Texture } from 'pixi.js';
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

		this.lastAnimation = 1;

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

		if (this.animation == this.lastAnimation) needsUpdate = false;

		this.updateSprites(needsUpdate, this.animation);

		if (
			this.wrappedFurniBase.visualizationType !==
			RoomVisualizationType.FURNITURE_ANIMATED
		)
			this.isPlaying = false;

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
			this.container.removeChild();
		}

		for (let layer = 0; layer < this.wrappedFurniBase.getLayerCount(); layer++) {
			this.updateSprite(layer);
		}

		this.lastAnimation = animation;
	}

	private updateSprite(layer: number) {
		let offsetDirection = 360 - (this.direction + 135);
		offsetDirection = ((offsetDirection % 360) + 360) % 360;

		const direction = this.wrappedFurniBase.getValidDirection(offsetDirection);

		const frame = this.isIcon
			? 0
			: this.wrappedFurniBase.getFrameFrom(
				direction,
				this.animation,
				layer,
				this.frame
			);

		const assetName = this.wrappedFurniBase.assetNameFrom(
			this.isIcon ? 1 : FurniData.DEFAULT_SIZE,
			this.isIcon ? 0 : layer,
			direction,
			frame
		);

		if (!assetName) {
			if (Engine.getInstance()?.config?.debug)
				Logger.debug('Unable to generate assetName');
			return;
		}

		let asset: FurniAsset = this.wrappedFurniBase.getAsset(assetName);
		if (!asset) {		
			if (Engine.getInstance()?.config?.debug)
				Logger.debug('No assets found');
			return;
		}

		if (!asset.sprite) asset = this.wrappedFurniBase.getAsset(asset.source);

		let sprite = this.getSprite(asset);
		if (asset.isFlipped()) {
			sprite.scale.x = -1;
		}

		const offsets: IOffsets = asset.offsets;

		if (!sprite) return;

		sprite.pivot.x = offsets.left;
		sprite.pivot.y = offsets.top;

		if (!this.isIcon && !this.wrappedFurniBase.hasLayers()) return;

		sprite = this.updateSpriteFrom(
			sprite,
			this.direction,
			this.wrappedFurniBase.getLayer(layer)
		);

		this.container.addChild(sprite);
	}

	private getSprite(asset: FurniAsset): Sprite {
		if (!asset.sprite) return;

		let texture: Texture;

		if (
			Engine.getInstance().userInterfaceManager.furniImager.hasTexture(
				asset.name
			)
		)
			texture =
				Engine.getInstance()?.userInterfaceManager?.furniImager?.getTexture(
					asset.name
				);
		else {
			texture = RenderingUtils.cropTexture(
				this.textureCache,
				asset.sprite.height,
				asset.sprite.width,
				asset.sprite.left,
				asset.sprite.top
			);
			Engine.getInstance()?.userInterfaceManager?.furniImager?.addTexture(
				asset.name,
				texture
			);
		}

		const sprite = Sprite.from(texture);
		return sprite;
	}

	private updateSpriteFrom(
		sprite: Sprite,
		direction: number,
		layer: Layer
	): Sprite {
		if (layer) {
			sprite.visible = true;

			if (layer.ink) {
				sprite.blendMode = FurniSpriteUtils.getBlendModeFromInk(
					layer.ink
				);
			}
			if (layer.z) {
				let relativeDepth =
					this.wrappedFurniBase.getDirection(direction) != null
						? this.wrappedFurniBase.getDirection(direction).getOffsetZ()
						: layer.z;
				relativeDepth = relativeDepth - layer.id * 0.001;
			} else {
				sprite.zIndex =
					1 * this.wrappedFurniBase.getDirection(direction).getOffsetZ();
			}
			if (layer.alpha) {
				sprite.alpha = (layer.alpha / 255) * this.multiplier;
			}
			if (layer.ignoreMouse) {
				sprite.cursor = 'default';
			}
		} else {
			sprite.alpha = (FurniData.DEFAULT_ALPHA / 255) * this.multiplier;
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

	setIcon(icon: boolean) {
		this.isIcon = icon;
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
