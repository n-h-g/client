import { IComponentUI } from '../../../../core/ui/IComponentUI'
import BottomBarGUI from '../../../../../ui/components/static/bottomBar/BottomBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { LoadingProgressEventData } from '../../events/data/loader/LoadingProgress'
import { UIEvents } from '../../events/UIEvents'
import { UIComponent } from '../UIComponent'

export class BottomBarUI implements IComponentUI { 
    private bottomBarGUI: typeof BottomBarGUI

    constructor() {
        this.bottomBarGUI = BottomBarGUI
    }

    init(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadingProgressEventData) => {
            if (event.width == 100) {
                let component = UiUtils.mountComponent(this.bottomBarGUI, UIComponent.BottomBarUI)
            }
        })
    }
}