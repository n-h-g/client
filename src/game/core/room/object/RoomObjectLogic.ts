import EventEmitter from 'eventemitter3';
import {Disposable} from '../Disposable';
import type {FederatedPointerEvent} from 'pixi.js';

export abstract class RoomObjectLogic implements Disposable {
    events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
    }

    abstract dispose(): void;

    abstract tick(delta: number): void;

    abstract registerEvents(): void;

    /** @param event the mouse event, e.g. to know the layer of the furni that was clicked. */
    abstract onClick(event?: FederatedPointerEvent): void;

    abstract onHover?(): void;
}
