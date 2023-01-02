import PreviewBoxGUI from '../../../../../ui/components/general/PreviewBoxGUI.vue'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import { ShowableComponent } from '../../../../core/ui/ShowableComponent'
import { UIEventsType } from '../../events/UIEventsType'
import { UIComponent } from '../UIComponent'

export class PreviewBoxUI extends ShowableComponent {
    private previewBoxGUI: typeof PreviewBoxGUI

    constructor() {
        super(PreviewBoxGUI, UIComponent.PreviewBoxUI)
    }
    
    public getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.PREVIEWBOX
    }
}