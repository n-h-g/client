import NavigatorGUI from '../../../../../ui/components/navigator/NavigatorGUI.vue'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import { BoxEvent } from '../../events/BoxEvent'
import UiUtils from '../../../../utils/UiUtils'
import { UIComponent } from '../UIComponent'

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
            if (event.type == 'navigator') {
                UiUtils.unrenderComponent(UIComponent.NavigatorUI)
            }
        })
    }

    show(): void {
        EventManager.read(UIEvents.OPEN, (event: BoxEvent) => {
            if (event.type == 'navigator') {
                UiUtils.renderComponent(this.NavigatorGUI, UIComponent.NavigatorUI)
            }
        })
    }
}