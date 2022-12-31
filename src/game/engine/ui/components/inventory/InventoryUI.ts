import InventoryGUI from '../../../../../ui/components/inventory/InventoryGUI.vue'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import { BoxEvent } from '../../events/BoxEvent'
import UiUtils from '../../../../utils/UiUtils'
import { UIComponent } from '../UIComponent'

export class InventoryUI implements IComponentShowableUI { 
    private inventoryGUI: typeof InventoryGUI

    constructor() {
        this.inventoryGUI = InventoryGUI
    }

    init(): void {
        this.show()
        this.hide()
    }

    hide(): void {
        EventManager.read(UIEvents.CLOSE, (event: BoxEvent) => {
            if (event.type == 'inventory') {
                UiUtils.unrenderComponent(UIComponent.InventoryUI)
            }
        })
    }

    show(): void {
        EventManager.read(UIEvents.OPEN, (event: BoxEvent) => {
            if (event.type == 'inventory') {
                UiUtils.renderComponent(this.inventoryGUI, UIComponent.InventoryUI)
            }
        })
    }
}