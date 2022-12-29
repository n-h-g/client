import { EventEmitter } from 'eventemitter3'
import { IEvent } from '../../../core/ui/events/IEvent'
import { UIEvents } from './UIEvents'

export class EventManager {
    private static _event = new EventEmitter()

    public static emit<T>(key: UIEvents, event?: IEvent<T>): void {
        this._event.emit(key, event)
    }

    public static read(key: UIEvents, callback): void {
        this._event.addListener(key, callback)
    }
}