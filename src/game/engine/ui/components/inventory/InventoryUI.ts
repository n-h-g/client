import InventoryGUI from '../../../../../ui/components/inventory/InventoryGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class InventoryUI extends ShowableComponent {
    constructor() {
        super(InventoryGUI, UIComponent.InventoryUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.INVENTORY;
    }
}
