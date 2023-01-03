import CatalogueGUI from '../../../../../ui/components/catalogue/CatalogueGUI.vue'
import { UIComponent } from '../UIComponent'
import { UIEventsType } from '../../events/UIEventsType'
import { ShowableComponent } from '../../../../core/ui/ShowableComponent'

export class CatalogueUI extends ShowableComponent {
    constructor() {
        super(CatalogueGUI, UIComponent.CatalogueUI)
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.CATALOGUE
    } 
}