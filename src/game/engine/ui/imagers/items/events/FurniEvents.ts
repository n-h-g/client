import * as PIXI from 'pixi.js';
import {FurniEventsType} from './FurniEventsType';

export class FurniEvents extends PIXI.utils.EventEmitter {
    onSpriteCreated() {
        this.emit(FurniEventsType.FURNI_SPRITE_CREATED);
    }
    onAssetsLoaded() {
        this.emit(FurniEventsType.FURNI_ASSETS_LOADING_COMPLETE);
    }
}
