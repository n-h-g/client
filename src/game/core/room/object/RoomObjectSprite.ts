import {Container, DisplayObject, Resource, Texture} from 'pixi.js';
import {IDisposable} from '../IDisposable';
import {IRoomObjectSprite} from './IRoomObjectSprite';

export class RoomObjectSprite implements IRoomObjectSprite {
    private _id: number;

    private _width: number;
    private _height: number;
    private _offsetX: number;
    private _offsetY: number;

    private _texture: Texture<Resource>;

    private _visible: boolean;

    private _clickable: boolean;

    private _alpha = 255;

    protected _container: Container;

    public constructor() {
        this._width = 0;
        this._height = 0;
        this._offsetX = 0;
        this._offsetY = 0;

        this._container = new Container();
    }

    public reset(): void {}

    public update(needsUpdate = false): void {}

    public dispose(): void {
        this._texture = null;
        this._alpha = 255;
        this._height = 0;
        this._width = 0;
    }

    public get container(): Container {
        return this._container;
    }

    public set container(container: Container) {
        if (this._container === container) return;

        this._texture = Texture.EMPTY;

        if (container) {
            this._width = container.width;
            this._height = container.height;
        }

        this._container = container;
    }
}
