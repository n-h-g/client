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
    CreateNewRoom = 36,
    
    //#region User
    UserMove = 10,
    UserSay = 11,
    UserTypeStatus = 12,
    UserLookAtPoint = 13,
    UserProfileInformation = 15,

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

    //#region Items
    RotateMoveItemEvent = 22,
    RoomPickupItemEvent = 23,
    RoomRotateItemEvent = 24, 
    RoomPlaceItemEvent = 25,
    RoomMoveItemEvent = 26,
    MoveWallItemEvent = 33,
    ToggleFloorItemEvent = 34,
    ToggleWallItemEvent = 35,

    //#region catalogue
    CatalogPagesListEvent = 800,
    RequestCatalogPageEvent = 801,
    StartNewTrade = 27,
    AddItemToTrade = 28,
    DeclineTrade = 30,
    AcceptTrade = 31,
    CatalogBuyItemEvent = 32,
  
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