import InventoryGUI from '../../../../../ui/components/inventory/InventoryGUI.vue'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import UiUtils from '../../../../utils/UiUtils'
import { UIComponent } from '../UIComponent'
import { ShowableComponent } from '../../../../core/ui/ShowableComponent'
import { UIEventsType } from '../../events/UIEventsType'

export class InventoryUI extends ShowableComponent { 
  
    constructor() {
        super(InventoryGUI, UIComponent.InventoryUI)
    }

    public getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.INVENTORY
    }
}