import { EventEmitter } from 'eventemitter3'
import { IEvent } from '../../../core/ui/events/IEvent'

export class EventManager {
    private static _event = new EventEmitter()

    public static emit<T>(key: string, event?: IEvent<T>): void {
        this._event.emit(key, event)
    }

    public static read(key: string, callback): void {
        this._event.addListener(key, callback)
    }
}