import {BaseTexture, IPointData, Point, Sprite, Texture} from 'pixi.js';

/**
 * Pixel perfect hit test for sprites: Pixi hits the whole rectangle of a sprite, transparent pixels included,
 * so a furni "stole" the clicks meant for the furni or the floor behind it.
 * The alpha of each spritesheet is read once and cached.
 */
export class AlphaHitTest {
    /** Minimum alpha (0-255) of a clickable pixel: AlphaTolerance.MATCH_OPAQUE_PIXELS of Nitro/Habbo. */
    static THRESHOLD = 128;

    private static alphaMaps = new WeakMap<BaseTexture, {width: number; data: Uint8ClampedArray} | null>();
    private static tempPoint = new Point();

    /**
     * Makes the sprite hittable only on its visible pixels.
     */
    static apply(sprite: Sprite): void {
        if ((sprite as any).__alphaHitTest) return;
        (sprite as any).__alphaHitTest = true;

        const containsRectangle = sprite.containsPoint.bind(sprite);

        sprite.containsPoint = (point: IPointData): boolean => {
            if (!containsRectangle(point)) return false;

            const local = sprite.worldTransform.applyInverse(point, AlphaHitTest.tempPoint);

            return AlphaHitTest.isOpaque(
                sprite.texture,
                local.x + sprite.anchor.x * sprite.texture.orig.width,
                local.y + sprite.anchor.y * sprite.texture.orig.height
            );
        };
    }

    /**
     * @param x,y coordinates inside the texture (0,0 = its top left corner).
     */
    static isOpaque(texture: Texture, x: number, y: number): boolean {
        const alphaMap = AlphaHitTest.getAlphaMap(texture.baseTexture);

        // the image can't be read (e.g. not loaded yet): the whole rectangle is hittable, as before
        if (!alphaMap) return true;

        const px = Math.floor(texture.frame.x + x);
        const py = Math.floor(texture.frame.y + y);

        if (px < texture.frame.x || py < texture.frame.y
            || px >= texture.frame.x + texture.frame.width || py >= texture.frame.y + texture.frame.height) {
            return false;
        }

        return alphaMap.data[(py * alphaMap.width + px) * 4 + 3] >= AlphaHitTest.THRESHOLD;
    }

    private static getAlphaMap(baseTexture: BaseTexture) {
        if (AlphaHitTest.alphaMaps.has(baseTexture)) return AlphaHitTest.alphaMaps.get(baseTexture);

        const source = (baseTexture.resource as any)?.source as CanvasImageSource | undefined;
        const width = baseTexture.realWidth;
        const height = baseTexture.realHeight;

        if (!source || !width || !height) return null; // not cached: retried when loaded

        let alphaMap = null;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const context = canvas.getContext('2d', {willReadFrequently: true});
            context.drawImage(source, 0, 0);

            alphaMap = {width, data: context.getImageData(0, 0, width, height).data};
        } catch (e) {
            // cross origin image without CORS: no pixel data, the rectangle is used
        }

        AlphaHitTest.alphaMaps.set(baseTexture, alphaMap);

        return alphaMap;
    }
}
