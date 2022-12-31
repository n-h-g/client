
import IFriendRepository from "../../../../core/game/messeger/friends/IFriendRepository";
import Service from "../../../../core/Service";
import IUserController from "../../../../core/users/IUserController";
import { IUserInfo } from "../../../../core/users/IUserInfo";
import { Engine } from "../../../../Engine";
import { OutgoingPacket } from "../../../../networking/packets/outgoing/OutgoingPacket";
import FriendRepository from "./FriendRepository";

//todo refactor this
export default class FriendService extends Service<IFriendRepository>{

    public constructor() {
        super();
        this.repository = new FriendRepository();
    }


    /**
     * Request to add a friend by username
     * @param username 
     */
    public requestAddFriend(username: string) {

        let user = this.getFriendByUsername(username);

        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.FriendRequestEvent, {
            id: user?.userInfo.id
        })
    }

    public removeFriend(friendId: number) {
        this.repository?.delete(friendId);

        //let friendUI = Engine.getInstance().userInterfaceManager?.getUIComponentManager().getComponent(UIComponent.FriendsMenuUI) as FriendsMenuUI;
        //let StaticContainerUI = Engine.getInstance().userInterfaceManager?.getUIComponentManager().getComponent(UIComponent.StaticContainerUI) as StaticContainerUI

        //friendUI.removeFriend(friendId);
        //StaticContainerUI.removeFriend(friendId);
    }

    /**
     * 
     * @param friend 
     */
    public addFriend(friend: IUserInfo) {
        if(!this.repository?.has(friend.id)) this.repository?.add(friend.id, friend);
    }

    /**
     * Get a friend by username
     * @param username 
     * @returns 
     */
    public getFriendByUsername(username: string): IUserController | null {
        let user = Engine.getInstance().usersService?._repository.findByUsername(username) as IUserController;

        if (!user) {
            user = Engine.getInstance().roomService?.CurrentRoom?.roomUserRepository.findByUsername(username) as IUserController;
        }

        if(!user) return null;

        return user;
    }

    /**
     * check whether a user is friend or not
     * @param username 
     * @returns 
     */
    public isFriend(username: string) {
        let user = this.getFriendByUsername(username);
        return this.repository?.has(user?.userInfo.id!);
    }
}