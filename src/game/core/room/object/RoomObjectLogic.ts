import EventEmitter from 'eventemitter3';
import {IDisposable} from '../IDisposable';

export abstract class RoomObjectLogic implements IDisposable {
    private _events: EventEmitter;

    constructor() {
        this._events = new EventEmitter();
    }

    abstract dispose(): void;

    abstract tick(delta: number): void;

    abstract registerEvents(): void;

    abstract onClick(): void;

    abstract onHover?(): void;

    get events(): EventEmitter {
        return this._events;
    }
}
