import { EventEmitter } from 'eventemitter3'
import { UIEvents } from '../../engine/events/ui/UIEvents'

export class EventManager {
    private static _event = new EventEmitter()

    public static emit<T>(key: UIEvents, event?: T): void {
        this._event.emit(key, event)
    }

    public static read(key: UIEvents, callback): void {
        this._event.addListener(key, callback)
    }
}