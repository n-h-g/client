export enum OutgoingPacket {
    // #region Handshake
    LoginMessage = 1,
    DisconnectMessage = 2,
    GetUserStats = 3,
    PingRequest = 4,
    LoginRequest = 49,

    //#region Navigator
    NavigatorPublicRooms = 5,
    NavigatorAllRooms = 6,
    NavigatorMyRooms = 7,
    UserEnterRoom = 8,
    UserExitRoom = 9,
    CreateNewRoom = 36,

    //#region User
    UserMove = 10,
    UserSay = 11,
    UserTypeStatus = 12,
    UserLookAtPoint = 13,
    UserProfileInformation = 15,
    UserActionEvent = 50,

    //#region Inventory
    RequestInventoryItemsEvent = 14,

    //#region Friends
    FriendRequestEvent = 16,
    AcceptFriendRequestEvent = 17,
    DeclineFriendRequestEvent = 18,
    GetFriendsInformationEvent = 19,
    SearchUserEvent = 20,
    RequestFriendRequestsEvent = 21,
    FollowFriendEvent = 37,
    FriendPrivateMessageEvent = 39,
    RemoveFriendEvent = 51,

    //#region Items
    RotateMoveItemEvent = 22,
    RoomPickupItemEvent = 23,
    RoomRotateItemEvent = 24,
    RoomPlaceItemEvent = 25,
    RoomMoveItemEvent = 26,
    RoomUseItemEvent = 27,
    /** Roll a dice (Nitro's FurnitureDiceActivateComposer): {id}. */
    RoomDiceActivateEvent = 52,
    /** Close a dice (Nitro's FurnitureDiceDeactivateComposer): {id}. */
    RoomDiceOffEvent = 53,
    /** The presets of a room dimmer (Nitro's RoomDimmerGetPresetsComposer): {id}. */
    RoomDimmerGetPresetsEvent = 54,
    /** Save a preset of the room dimmer (Nitro's RoomDimmerSavePresetsComposer): {id, preset, backgroundOnly, color, brightness, apply}. */
    RoomDimmerSavePresetEvent = 55,
    /** Switch the room dimmer on/off (Nitro's RoomDimmerChangeStateComposer): {id}. */
    RoomDimmerToggleEvent = 56,
    /** The badges of the user (inventory, tab Badges). */
    RequestInventoryBadgesEvent = 57,
    /** The user wears these badges, in this order: {codes} (at most 5). */
    SetWornBadgesEvent = 58,
    /** The bots in the inventory of the user (tab Bots). */
    RequestInventoryBotsEvent = 59,
    /** Place a bot of the inventory in the room, next to the user: {id}. */
    PlaceBotEvent = 60,
    /** Pick up a bot from the room (its owner or the owner of the room): {id} (its entity). */
    PickupBotEvent = 61,
    /** The pets of the user (tab Pets). */
    RequestInventoryPetsEvent = 62,
    /** A pet of the inventory goes in the room: {id}. */
    PlacePetEvent = 63,
    /** A pet goes back to the inventory of its owner: {id} (the entity). */
    PickupPetEvent = 64,
    /** The owner of the room sends a user out of it: {userId}. */
    RoomKickUserEvent = 65,
    /** The owner of the room bans a user: {userId, length} (hour, day, permanent). */
    RoomBanUserEvent = 66,
    /** Answer to the doorbell: {userId, accept}. */
    DoorbellAnswerEvent = 67,
    /** The users banned from the current room (room settings). */
    RequestRoomBansEvent = 68,
    /** Removes a ban of the current room: {userId}. */
    RoomUnbanEvent = 69,
    /** The user doesn't wait at the doorbell anymore (Cancel in the waiting window). */
    DoorbellCancelEvent = 70,
    /** The card of a user (clicking its avatar): {userId}, the server answers UserInfo. */
    RequestUserInfoEvent = 71,
    /** The user changes its motto: {motto} (38 characters at most). */
    UpdateMottoEvent = 72,
    /** The user scratches a pet ("Pet" in its menu): {id} (the entity). */
    ScratchPetEvent = 73,
    /** The user gets on a horse or off the one it rides: {id (the entity of the pet), ride}. */
    RidePetEvent = 74,
    /** A wallpaper/floor/landscape applied from the inventory (Nitro's FurniturePlacePaintComposer): {id}. */
    RoomApplyDecorationEvent = 29,
    MoveWallItemEvent = 33,
    ToggleFloorItemEvent = 17,
    ToggleWallItemEvent = 35,

    //#region catalogue
    CatalogPagesListEvent = 800,
    RequestCatalogPageEvent = 801,
    StartNewTrade = 97,
    AddItemToTrade = 28,
    DeclineTrade = 30,
    AcceptTrade = 31,
    CatalogBuyItemEvent = 802,
    /** The search of the furni: {query, names} (names: class names whose FurnitureData name contains the text). */
    CatalogSearchEvent = 803,

    //#region rooms
    SaveRoomAdsEvent = 38,
    ChangeRoomColors = 42,
    RoomUserGiveRightsEvent = 45,
    RoomUserRemoveRightsEvent = 46,
    UserIsTypingEvent = 47,
    UserChangeLookEvent = 48,
    RequestRoomDataEvent = 40,

    RequestRoomSettingsEvent = 43,
    SaveRoomSettingsEvent = 44,

    //#region generic
    DevTerminalSaveCodeEvent = 100,
    HotelViewEvent = 41,
}
