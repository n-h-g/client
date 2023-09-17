import {AvatarEventsType} from '../enum/events/AvatarEventsType';

import * as PIXI from 'pixi.js';

export default class AvatarEvents extends PIXI.utils.EventEmitter {
    public onPlaceHolderLoad() {
        this.emit(AvatarEventsType.PLACEHOLDER_LOAD_COMPLETE);
    }

    public onAssetsLoaded() {
        this.emit(AvatarEventsType.ASSETS_LOADED);
    }

    public onLoad() {
        this.emit(AvatarEventsType.LOAD_COMPLETE);
    }
}
