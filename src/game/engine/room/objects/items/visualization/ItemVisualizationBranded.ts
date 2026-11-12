import {Texture} from 'pixi.js';
import {BrandedImage, Furni} from '../../../../ui/imagers/items/Furni';
import {Item} from '../Item';
import {RoomBranding} from '../logic/ItemLogicRoomBranding';
import {ItemVisualizationStatic} from './ItemVisualizationStatic';

/**
 * A furni that shows an image downloaded from the URL of its data (Nitro's FurnitureBrandedImageVisualization):
 * the room background and the billboards. The data comes from ItemLogicRoomBranding; the subclasses say where the
 * image goes (see Furni.setBrandedImage).
 */
export abstract class ItemVisualizationBranded extends ItemVisualizationStatic {
    /** The downloaded images by URL: the same image in more furni or rooms is downloaded once. */
    private static readonly textures = new Map<string, Promise<Texture | null>>();

    protected branding: RoomBranding | null = null;
    private texture: Texture | null = null;
    /** The URL being loaded: a newer one wins over an older that ends later. */
    private loadingUrl = '';

    protected constructor(item: Item) {
        super(item);
    }

    /** Where the image goes and its depth among the layers of the furni. */
    protected abstract imagePlacement(branding: RoomBranding): Pick<BrandedImage, 'anchor' | 'offsetZ'>;

    /** New data of the furni: its image is downloaded (if new) and drawn. */
    setBranding(branding: RoomBranding): void {
        const urlChanged = branding.imageUrl !== this.branding?.imageUrl;
        this.branding = branding;

        if (!urlChanged) {
            this.applyImage();
            return;
        }

        this.texture = null;
        this.loadingUrl = branding.imageUrl;
        this.applyImage();

        if (!branding.imageUrl) return;

        const url = branding.imageUrl;
        ItemVisualizationBranded.load(url).then(texture => {
            if (this.loadingUrl !== url) return;

            this.texture = texture;
            this.applyImage();
        });
    }

    async render(): Promise<void> {
        await super.render();

        // a new sprite: it shows the asset until it gets the image
        this.applyImage();
    }

    protected applyImage(): void {
        const furni = this.sprite as Furni | undefined;
        if (!furni || typeof furni.setBrandedImage !== 'function') return;

        furni.setBrandedImage(this.texture && this.branding
            ? {
                texture: this.texture,
                offsetX: this.branding.offsetX,
                offsetY: this.branding.offsetY,
                state: this.branding.state,
                ...this.imagePlacement(this.branding),
            }
            : null);

        if (this.container) this.container.zIndex = this.getZIndex();
    }

    /**
     * The image of a URL, null if it can't be loaded (an image of another site is drawn only if it allows it: CORS).
     */
    private static load(url: string): Promise<Texture | null> {
        let texture = this.textures.get(url);

        if (!texture) {
            texture = new Promise(resolve => {
                const image = new Image();
                image.crossOrigin = 'anonymous';
                image.onload = () => resolve(Texture.from(image));
                image.onerror = () => resolve(null);
                image.src = url;
            });

            // a failure is tried again the next time (e.g. the site was down)
            texture.then(loaded => { if (!loaded) this.textures.delete(url); });
            this.textures.set(url, texture);
        }

        return texture;
    }
}
