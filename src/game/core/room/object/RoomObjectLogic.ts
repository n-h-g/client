import EventEmitter from "eventemitter3";
import { IDisposable } from "../IDisposable";

export abstract class RoomObjectLogic implements IDisposable {

    /**
     *  A event emitter for each logic
     *  Use this for dispatching events.
     */
    private _events: EventEmitter

    public constructor() {
        this._events = new EventEmitter()
    }

    abstract dispose(): void

    abstract tick(delta: number): void

    abstract registerEvents(): void

    abstract onClick(): void

    abstract onHover?(): void

    public get events(): EventEmitter {
        return this._events
    } 
}