import NavigatorGUI from '../../../../../ui/components/navigator/NavigatorGUI.vue'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import UiUtils from '../../../../utils/UiUtils'
import { UIComponent } from '../UIComponent'
import { UIEventsType } from '../../events/UIEventsType'
import { ShowableComponent } from '../../../../core/ui/ShowableComponent'

export class NavigatorUI extends ShowableComponent {
    constructor() {
        super(NavigatorGUI, UIComponent.NavigatorUI)
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.NAVIGATOR
    } 
}