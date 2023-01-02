import PreviewBoxGUI from '../../../../../ui/components/general/PreviewBoxGUI.vue'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { BoxEvent } from '../../events/general/BoxEvent'
import { UIEvents } from '../../events/UIEvents'
import { UIEventsType } from '../../events/UIEventsType'
import { UIComponent } from '../UIComponent'

export class PreviewBoxUI implements IComponentShowableUI {
    private previewBoxGUI: typeof PreviewBoxGUI

    constructor() {
        this.previewBoxGUI = PreviewBoxGUI
    }
    
    init(): void {
        this.hide()
        this.show()
    }

    hide(): void {
        EventManager.read(UIEvents.CLOSE, (event: BoxEvent) => {
            if (event.type == UIEventsType.PREVIEWBOX) {
                UiUtils.unrenderComponent(UIComponent.PreviewBoxUI)
            }
        })
    }

    show(): void {
        EventManager.read(UIEvents.OPEN, (event: BoxEvent) => {
            if (event.type == UIEventsType.PREVIEWBOX) {
                UiUtils.renderComponent(this.previewBoxGUI, UIComponent.PreviewBoxUI)
            }
        })
    }
}