import {Container, Sprite, Texture} from 'pixi.js';

export class FurniSprite extends Sprite {
    private _textureCache: Texture;
    private _animation: number;
    private _frame: number;
    private _direction: number;

    constructor(animation: number, direction: number, frame: number) {
        super();

        this._animation = animation;
        this._direction = direction;
        this._frame = frame;
    }
}
