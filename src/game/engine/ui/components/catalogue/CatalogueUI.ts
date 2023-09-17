import CatalogueGUI from '../../../../../ui/components/catalogue/CatalogueGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class CatalogueUI extends ShowableComponent {
    constructor() {
        super(CatalogueGUI, UIComponent.CatalogueUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.CATALOGUE;
    }
}
