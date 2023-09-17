import EventEmitter from 'eventemitter3';
import {Disposable} from '../Disposable';

export abstract class RoomObjectLogic implements Disposable {
    events: EventEmitter;

    constructor() {
        this.events = new EventEmitter();
    }

    abstract dispose(): void;

    abstract tick(delta: number): void;

    abstract registerEvents(): void;

    abstract onClick(): void;

    abstract onHover?(): void;
}
