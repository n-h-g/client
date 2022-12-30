import { IComponentUI } from '../../../../core/ui/IComponentUI'
import TopBarGUI from '../../../../../ui/components/static/topBar/TopBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { LoadProgressEvent } from '../../events/LoadProgressEvent'

export class TopBarUI implements IComponentUI { 
    private topBarUI: typeof TopBarGUI

    constructor() {
        this.topBarUI = TopBarGUI
    }

    init(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadProgressEvent) => {
            if (event.data.width == 100) {
                UiUtils.renderComponent(this.topBarUI, 'topBar')
            }
        })
    }
}