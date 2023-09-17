import {AvatarEventsType} from '../enum/events/AvatarEventsType';

import * as PIXI from 'pixi.js';

export class AvatarEvents extends PIXI.utils.EventEmitter {
    onPlaceHolderLoad() {
        this.emit(AvatarEventsType.PLACEHOLDER_LOAD_COMPLETE);
    }

    onAssetsLoaded() {
        this.emit(AvatarEventsType.ASSETS_LOADED);
    }

    onLoad() {
        this.emit(AvatarEventsType.LOAD_COMPLETE);
    }
}
