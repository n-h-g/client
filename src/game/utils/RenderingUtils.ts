import {Texture, Rectangle} from 'pixi.js';
import Point3d from './point/Point3d';

export default class RenderingUtils {
    static arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    static cropTexture(
        texture: Texture,
        height: number,
        width: number,
        left: number,
        top: number
    ) {
        return new Texture(
            texture.baseTexture,
            new Rectangle(left, top, width, height)
        );
    }

    static getPointFromObject(object: {x; y; z}) {
        return new Point3d(object.x, object.y, object.z);
    }

    static convertCanvasToImage(canvas) {
        const image = new Image();
        image.src = canvas.toDataURL('image/png');
        return image;
    }
}
