import {EventEmitter} from 'eventemitter3';
import {Events} from '../../engine/events/Events';

export class EventManager {
    private static eventManager = new EventEmitter();

    static emit<T>(key: Events, event?: T): void {
        this.eventManager.emit(key.key, event);
    }

    static read(key: Events, callback: (payload: any) => void): void {
        this.eventManager.addListener(key.key, callback);
    }
}
