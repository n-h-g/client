import NavigatorGUI from '../../../../../ui/components/navigator/NavigatorGUI.vue'
import { EventManager } from '../../../../core/events/EventManager'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import UiUtils from '../../../../utils/UiUtils'
import { UIComponent } from '../UIComponent'
import { ShowableComponent } from '../../../../core/ui/ShowableComponent'
import { UIEventsType } from '../../../events/ui/UIEventsType'

export class NavigatorUI extends ShowableComponent {
    constructor() {
        super(NavigatorGUI, UIComponent.NavigatorUI)
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.NAVIGATOR
    } 
}