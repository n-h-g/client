import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { LoadingProgressEventData } from '../../events/data/loader/LoadingProgress'
import { EventManager } from '../../../../core/events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { UIComponent } from '../UIComponent'
import { Engine } from '../../../../Engine'
import { DeletableComponent } from '../../../../core/ui/DeletableComponent'
import { UIEventsType } from '../../events/UIEventsType'

export class GameLoaderUI extends DeletableComponent {
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
        })
    }

    delete(): void {
        UiUtils.dismountComponent(UIComponent.GameLoaderUI)
    }
}