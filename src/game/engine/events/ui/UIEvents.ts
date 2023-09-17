import {Events} from '../Events';

export class UIEvents extends Events {
    protected constructor(key: string) {
        super(key);
    }

    static LOAD: UIEvents = new UIEvents('loading');
    static SET_TOPBAR: UIEvents = new UIEvents('set_top_bar');
    static NAVIGATOR_ROOMS_ADDED: UIEvents = new UIEvents(
        'navigator_rooms_added'
    );
    static OPEN: UIEvents = new UIEvents('open_box');
    static CLOSE: UIEvents = new UIEvents('close_box');
    static INVENTORY_ITEMS_ADDED: UIEvents = new UIEvents(
        'inventory_items_added'
    );
    static PREVIEW_BOX_MODE: UIEvents = new UIEvents('preview_box_mode');
    static HOTEL_VIEW: UIEvents = new UIEvents('hotel_view');
    static ROOM_UI: UIEvents = new UIEvents('room_ui');
    static ROOM_NEW_MESSAGE: UIEvents = new UIEvents('room_new_message');
    static ROOM_UPDATE_CHAT: UIEvents = new UIEvents(
        'room_update_messages'
    );
    static AVATAR_CONTAINER_UPDATED: UIEvents = new UIEvents(
        'avatar_container_updated'
    );
    static CATALOGUE_PAGES_UPDATED: UIEvents = new UIEvents(
        'catalog_pages_updated'
    );
    static CATALOG_ITEMS_UPDATED: UIEvents = new UIEvents(
        'catalog_items_updated'
    );
    static ENTER_ROOM_INFO: UIEvents = new UIEvents('enter_room_info');
}
