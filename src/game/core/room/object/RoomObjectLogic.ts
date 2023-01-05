import EventEmitter from "eventemitter3";

export abstract class RoomObjectLogic {

    /**
     *  A event emitter for each logic
     *  Use this for dispatching events.
     */
    private _events: EventEmitter

    public constructor() {
        this._events = new EventEmitter()

        this._events.addListener
    }

    abstract tick(delta: number): void

    abstract registerEvents(): void

    abstract onClick(): void

    abstract onHover?(): void

    abstract onMove?(delta: number): void

    public get events(): EventEmitter {
        return this._events
    } 
}