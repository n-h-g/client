import {Events} from '../Events';

export class UIEvents extends Events {
    protected constructor(key: string) {
        super(key);
    }

    public static LOAD: UIEvents = new UIEvents('loading');
    public static SET_TOPBAR: UIEvents = new UIEvents('set_top_bar');
    public static NAVIGATOR_ROOMS_ADDED: UIEvents = new UIEvents(
        'navigator_rooms_added'
    );
    public static OPEN: UIEvents = new UIEvents('open_box');
    public static CLOSE: UIEvents = new UIEvents('close_box');
    public static INVENTORY_ITEMS_ADDED: UIEvents = new UIEvents(
        'inventory_items_added'
    );
    public static PREVIEW_BOX_MODE: UIEvents = new UIEvents('preview_box_mode');
    public static HOTEL_VIEW: UIEvents = new UIEvents('hotel_view');
    public static ROOM_UI: UIEvents = new UIEvents('room_ui');
    public static ROOM_NEW_MESSAGE: UIEvents = new UIEvents('room_new_message');
    public static ROOM_UPDATE_CHAT: UIEvents = new UIEvents(
        'room_update_messages'
    );
    public static AVATAR_CONTAINER_UPDATED: UIEvents = new UIEvents(
        'avatar_container_updated'
    );
    public static CATALOGUE_PAGES_UPDATED: UIEvents = new UIEvents(
        'catalog_pages_updated'
    );
    public static CATALOG_ITEMS_UPDATED: UIEvents = new UIEvents(
        'catalog_items_updated'
    );
    public static ENTER_ROOM_INFO: UIEvents = new UIEvents('enter_room_info');
}
