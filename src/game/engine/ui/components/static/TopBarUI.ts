import { IComponentUI } from '../../../../core/ui/IComponentUI'
import TopBarGUI from '../../../../../ui/components/static/topBar/TopBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { LoadingProgressEventData } from '../../events/data/loader/LoadingProgress'
import { UIComponent } from '../UIComponent'
import { Engine } from '../../../../Engine'

export class TopBarUI implements IComponentUI { 
    private topBarUI: typeof TopBarGUI

    constructor() {
        this.topBarUI = TopBarGUI
    }

    init(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadingProgressEventData) => {
            if (event.width == 100 || Engine.getInstance().config.offlineMode) {
                UiUtils.mountComponent(this.topBarUI, UIComponent.TopBarUI)
            }
        })
    }
}