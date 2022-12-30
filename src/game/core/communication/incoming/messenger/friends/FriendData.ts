import { UpdateFriendAction } from "../../../../game/messeger/friends/UpdateFriendAction";
import { IUserInfo } from "../../../../users/IUserInfo";

export interface FriendData {
    action: UpdateFriendAction,
    friend: IUserInfo
}