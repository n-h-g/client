import {EventManager} from '../../../../core/events/EventManager';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The furni found by a search of the catalogue: {query, items} (the catalogue shows only the last search). */
export class CatalogueSearch extends MessageHandler {
    handle(): void {
        EventManager.emit(UIEvents.CATALOG_SEARCH_RESULTS, this.message);
    }
}
