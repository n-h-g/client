import {Container, Resource, Texture} from 'pixi.js';

export class RoomObjectSprite {
    private id: number;
    private width: number;
    private height: number;
    private offsetX: number;
    private offsetY: number;
    private texture: Texture<Resource>;
    private visible: boolean;
    private clickable: boolean;
    private alpha = 255;
    private wrappedContainer: Container;

    constructor() {
        this.width = 0;
        this.height = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.wrappedContainer = new Container();
    }

    reset(): void {}

    update(needsUpdate = false): void {}

    dispose(): void {
        this.texture = null;
        this.alpha = 255;
        this.height = 0;
        this.width = 0;
    }

    get container(): Container {
        return this.wrappedContainer;
    }

    set container(container: Container) {
        if (this.wrappedContainer === container) return;

        this.texture = Texture.EMPTY;

        if (container) {
            this.width = container.width;
            this.height = container.height;
        }

        this.wrappedContainer = container;
    }
}
