import {Container} from 'pixi.js';
import {IRoomObjectSprite} from './IRoomObjectSprite';
import {RoomObjectSprite} from './RoomObjectSprite';

export default abstract class RoomObjectVisualization {
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

    public get sprite(): IRoomObjectSprite {
        return this._sprite;
    }

    public set sprite(sprite: IRoomObjectSprite) {
        this._sprite = sprite;
    }

    public abstract getZIndex(): number;

    public dispose(): void {
        this.container.destroy();
    }

    public abstract render(): void;

    public set needsUpdate(update: boolean) {
        this._needsUpdate = update;
    }

    public get needsUpdate(): boolean {
        return this._needsUpdate;
    }

    public get offsetX(): number {
        return this._offsetX;
    }

    public get offsetY(): number {
        return this._offsetY;
    }

    public set offsetX(x: number) {
        this._offsetX = x;
    }

    public set offsetY(y: number) {
        this._offsetY = y;
    }

    public get zIndex(): number {
        return this._zIndex;
    }

    public get container(): Container {
        return this._container;
    }

    public set container(container: Container) {
        this._container = container;
    }
}
