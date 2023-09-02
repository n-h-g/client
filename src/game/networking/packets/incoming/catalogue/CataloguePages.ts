import { CataloguePage } from "../../../../core/communication/incoming/catalogue/CataloguePage";
import { EventManager } from "../../../../core/events/EventManager";
import { CataloguePagesData } from "../../../../engine/events/ui/data/catalogue/CataloguePagesData";
import { UIEvents } from "../../../../engine/events/ui/UIEvents";
import { MessageHandler } from "../../../handler/MessageHandler";

export class CataloguePages extends MessageHandler {
    public handle(): void {
        let pages = this.message.data as CataloguePage[]

        EventManager.emit<CataloguePagesData>(UIEvents.CATALOGUE_PAGES_UPDATED, {
            pages: pages
        })
    }
}