import IFriendRepository from "../../../../core/game/messeger/friends/IFriendRepository";
import Repository from "../../../../core/Repository";
import { IUserInfo } from "../../../../core/users/IUserInfo";

export default class FriendRepository extends Repository<number, IUserInfo> implements IFriendRepository {
    
}