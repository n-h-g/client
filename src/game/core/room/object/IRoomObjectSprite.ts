import {Container, DisplayObject, Sprite} from 'pixi.js';
import {IDisposable} from '../IDisposable';

export interface IRoomObjectSprite extends IDisposable {
    container: Container;
    reset(): void;
    update(needsUpdate: boolean): void;
}
