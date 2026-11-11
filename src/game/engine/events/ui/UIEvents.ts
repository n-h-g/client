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
    static AVATAR_CONTEXT_MENU: UIEvents = new UIEvents('avatar_context_menu');
    /** The avatar under the mouse changed (AvatarHoverData), null: no avatar. Its name is shown over it. */
    static AVATAR_HOVER: UIEvents = new UIEvents('avatar_hover');
    static CATALOGUE_PAGES_UPDATED: UIEvents = new UIEvents(
        'catalog_pages_updated'
    );
    static CATALOG_ITEM_BOUGHT: UIEvents = new UIEvents('catalog_item_bought');
    /** The furni found by a search of the catalogue: {query, items}. */
    static CATALOG_SEARCH_RESULTS: UIEvents = new UIEvents('catalog_search_results');
    static CATALOG_ITEMS_UPDATED: UIEvents = new UIEvents(
        'catalog_items_updated'
    );
    static ENTER_ROOM_INFO: UIEvents = new UIEvents('enter_room_info');
    static CHANGE_LOOK: UIEvents = new UIEvents('change_look')
    /** A notification in the bubble alerts (top right), see BubbleAlertData. */
    static BUBBLE_ALERT: UIEvents = new UIEvents('bubble_alert');
    /** A message in a "Notice!" window (e.g. kicked out of the room): NoticeData. */
    static NOTICE: UIEvents = new UIEvents('notice');
    /** The users banned from the current room: RoomBansData. */
    static ROOM_BANS: UIEvents = new UIEvents('room_bans');
    /** The chat whispers to a user (WhisperData), or talks to the room again with an empty username. */
    static CHAT_WHISPER: UIEvents = new UIEvents('chat_whisper');
    /** The badges of the user (InventoryBadgesData). */
    static INVENTORY_BADGES: UIEvents = new UIEvents('inventory_badges');
    /** The motto and the worn badges of a user, for its card in the room (UserInfoData). */
    static USER_INFO: UIEvents = new UIEvents('user_info');
    /** The bots in the inventory of the user (InventoryBotsData). */
    static INVENTORY_BOTS: UIEvents = new UIEvents('inventory_bots');
    /** The pets of the user (InventoryPetsData). */
    static INVENTORY_PETS: UIEvents = new UIEvents('inventory_pets');
}
