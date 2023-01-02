import { Texture, Rectangle } from 'pixi.js'

export default class RenderingUtils {
    static arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
        let binary = ''
        let bytes = new Uint8Array(arrayBuffer)
        let len = bytes.byteLength
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return window.btoa(binary)
    }

    static cropTexture(texture: Texture, height: number, width: number, left: number, top: number) {
        return new Texture(texture.baseTexture, new Rectangle(left, top, width, height))
    }
}