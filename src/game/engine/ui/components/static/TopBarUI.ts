import { IComponentUI } from '../../../../core/ui/IComponentUI'
import TopBarGUI from '../../../../../ui/components/static/topBar/TopBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { LoadProgressEvent } from '../../events/loader/LoadProgressEvent'
import { UIComponent } from '../UIComponent'

export class TopBarUI implements IComponentUI { 
    private topBarUI: typeof TopBarGUI

    constructor() {
        this.topBarUI = TopBarGUI
    }

    init(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadProgressEvent) => {
            if (event.width == 100) {
                UiUtils.renderComponent(this.topBarUI, UIComponent.TopBarUI)
            }
        })
    }
}