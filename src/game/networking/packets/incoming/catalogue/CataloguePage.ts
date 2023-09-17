import {EventManager} from '../../../../core/events/EventManager';
import {CataloguePageData} from '../../../../engine/events/ui/data/catalogue/CataloguePageData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

export class CataloguePage extends MessageHandler {
    handle(): void {
        const items = this.message.data;

        EventManager.emit<CataloguePageData>(UIEvents.CATALOG_ITEMS_UPDATED, {
            items: items,
        });
    }
}
