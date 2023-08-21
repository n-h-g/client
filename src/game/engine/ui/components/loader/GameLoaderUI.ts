import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { LoadingProgressEventData } from '../../../events/ui/data/loader/LoadingProgress'
import { EventManager } from '../../../../core/events/EventManager'
import { UIComponent } from '../UIComponent'
import { Engine } from '../../../../Engine'
import { DeletableComponent } from '../../../../core/ui/DeletableComponent'
import { UIEventsType } from '../../../events/ui/UIEventsType'
import { UIEvents } from '../../../events/ui/UIEvents'

export class GameLoaderUI extends DeletableComponent {

    /*
        0 = initializing
        50 = assets loading
        100 = game connected
    */
    private _progress: number = 0;

    constructor() {
        super(GameLoaderGUI, UIComponent.GameLoaderUI)
    }

    init(): void {
        UiUtils.mountComponent(this.component, UIComponent.GameLoaderUI)

        this.registerEvents()
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.LOADER
    }

    registerEvents(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadingProgressEventData) => {
            if (event.width == 100 || Engine.getInstance().config.offlineMode) {
                this.delete()
            }

            this._progress = event.width;
        })
    }

    delete(): void {
        UiUtils.dismountComponent(UIComponent.GameLoaderUI)
    }

    public get progress() {
        return this._progress;
    }
}