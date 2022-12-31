import NavigatorGUI from '../../../../../ui/components/navigator/NavigatorGUI.vue'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import { BoxEvent } from '../../events/general/BoxEvent'
import UiUtils from '../../../../utils/UiUtils'
import { UIComponent } from '../UIComponent'
import { UIEventsType } from '../../events/UIEventsType'

export class NavigatorUI implements IComponentShowableUI { 
    private NavigatorGUI: typeof NavigatorGUI

    constructor() {
        this.NavigatorGUI = NavigatorGUI
    }

    init(): void {
        this.show()
        this.hide()
    }

    hide(): void {
        EventManager.read(UIEvents.CLOSE, (event: BoxEvent) => {
            if (event.type == UIEventsType.NAVIGATOR) {
                UiUtils.unrenderComponent(UIComponent.NavigatorUI)
            }
        })
    }

    show(): void {
        EventManager.read(UIEvents.OPEN, (event: BoxEvent) => {
            if (event.type == UIEventsType.NAVIGATOR) {
                UiUtils.renderComponent(this.NavigatorGUI, UIComponent.NavigatorUI)
            }
        })
    }
}