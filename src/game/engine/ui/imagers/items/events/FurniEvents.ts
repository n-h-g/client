
import * as PIXI from 'pixi.js'
import { FurniEventsType } from './FurniEventsType'

export default class FurniEvents extends PIXI.utils.EventEmitter {

    public onSpriteCreated() {
        this.emit(FurniEventsType.FURNI_SPRITE_CREATED)
    }
    public onAssetsLoaded() {
        this.emit(FurniEventsType.FURNI_ASSETS_LOADING_COMPLETE)
    }
}