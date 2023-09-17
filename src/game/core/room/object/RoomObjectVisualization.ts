import {Container} from 'pixi.js';
import {RoomObjectSprite} from './RoomObjectSprite';

export abstract class RoomObjectVisualization {
    offsetX: number;
    offsetY: number;
    zIndex: number;
    container: Container;
	needsUpdate: boolean;
    sprite: RoomObjectSprite;

    constructor(offsetX: number, offsetY: number, zIndex: number) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.zIndex = zIndex;
        this.container = null;
        this.needsUpdate = false;
        this.sprite = new RoomObjectSprite();
    }

    dispose(): void {
        this.container.destroy();
    }

	abstract getZIndex(): number;

    abstract render(): void;
}
