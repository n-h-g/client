import { EventEmitter } from 'eventemitter3'

export class Event {
    private static _event = new EventEmitter()

    public static emit(key: string): void {
        this._event.emit(key)
    }

    public static read(key: string, callback): void {
        this._event.addListener(key, callback)
    }
}