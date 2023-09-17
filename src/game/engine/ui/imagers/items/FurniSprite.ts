import {Container, Sprite, Texture} from 'pixi.js';

export class FurniSprite extends Sprite {
    private textureCache: Texture;
    private animation: number;
    private frame: number;
    private direction: number;

    constructor(animation: number, direction: number, frame: number) {
        super();

        this.animation = animation;
        this.direction = direction;
        this.frame = frame;
    }
}
