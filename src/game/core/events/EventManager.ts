import {EventEmitter} from 'eventemitter3';
import {Events} from '../../engine/events/Events';

export class EventManager {
    private static _eventManager = new EventEmitter();

    static emit<T>(key: Events, event?: T): void {
        this._eventManager.emit(key.key, event);
    }

    static read(key: Events, callback: (payload: any) => void): void {
        this._eventManager.addListener(key.key, callback);
    }
}
