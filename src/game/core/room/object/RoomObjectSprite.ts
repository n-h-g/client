import {Container, Resource, Texture} from 'pixi.js';

export class RoomObjectSprite {
    private _id: number;
    private _width: number;
    private _height: number;
    private _offsetX: number;
    private _offsetY: number;
    private _texture: Texture<Resource>;
    private _visible: boolean;
    private _clickable: boolean;
    private _alpha = 255;
    private _container: Container;

    constructor() {
        this._width = 0;
        this._height = 0;
        this._offsetX = 0;
        this._offsetY = 0;
        this._container = new Container();
    }

    reset(): void {}

    update(needsUpdate = false): void {}

    dispose(): void {
        this._texture = null;
        this._alpha = 255;
        this._height = 0;
        this._width = 0;
    }

    get container(): Container {
        return this._container;
    }

    set container(container: Container) {
        if (this._container === container) return;

        this._texture = Texture.EMPTY;

        if (container) {
            this._width = container.width;
            this._height = container.height;
        }

        this._container = container;
    }
}
