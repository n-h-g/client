import {Container} from 'pixi.js';
import {IRoomObjectSprite} from './IRoomObjectSprite';
import {RoomObjectSprite} from './RoomObjectSprite';

export abstract class RoomObjectVisualization {
    protected _offsetX: number;
    protected _offsetY: number;
    protected _zIndex: number;
    protected _container: Container;
    protected _needsUpdate: boolean;

    private _sprite: IRoomObjectSprite;

    constructor(offsetX: number, offsetY: number, zIndex: number) {
        this._offsetX = offsetX;
        this._offsetY = offsetY;
        this._zIndex = zIndex;
        this._container = null;
        this._needsUpdate = false;

        this._sprite = new RoomObjectSprite();
    }

    get sprite(): IRoomObjectSprite {
        return this._sprite;
    }

    set sprite(sprite: IRoomObjectSprite) {
        this._sprite = sprite;
    }

    abstract getZIndex(): number;

    dispose(): void {
        this.container.destroy();
    }

    abstract render(): void;

    set needsUpdate(update: boolean) {
        this._needsUpdate = update;
    }

    get needsUpdate(): boolean {
        return this._needsUpdate;
    }

    get offsetX(): number {
        return this._offsetX;
    }

    get offsetY(): number {
        return this._offsetY;
    }

    set offsetX(x: number) {
        this._offsetX = x;
    }

    set offsetY(y: number) {
        this._offsetY = y;
    }

    get zIndex(): number {
        return this._zIndex;
    }

    get container(): Container {
        return this._container;
    }

    set container(container: Container) {
        this._container = container;
    }
}
