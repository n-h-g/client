import { IComponentUI } from '../../../../core/ui/IComponentUI'
import BottomBarGUI from '../../../../../ui/components/static/bottomBar/BottomBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { LoadProgressEvent } from '../../events/LoadProgressEvent'
import { UIEvents } from '../../events/UIEvents'

export class BottomBarUI implements IComponentUI { 
    private bottomBarGUI: typeof BottomBarGUI

    constructor() {
        this.bottomBarGUI = BottomBarGUI
    }

    init(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadProgressEvent) => {
            if (event.data.width == 100) {
                UiUtils.renderComponent(this.bottomBarGUI, 'bottomBar')
            }
        })
    }
}