import {Engine} from '../../Engine';
import {OutgoingPacket} from '../../networking/packets/outgoing/OutgoingPacket';
import {IComponentShowableUI} from '../../core/ui/IComponentShowableUI';
import {UIComponent} from '../ui/components/UIComponent';

/** A friend (or a user that sent a request) as the server sends it. */
export interface Friend {
    id: number;
    username: string;
    look: string;
    motto: string;
    online: boolean;
}

export interface FriendsState {
    friends: Friend[];
    /** Users that sent a friendship request to the logged user. */
    requests: Friend[];
    /** Ids of the users the logged user sent a request to. */
    sent: number[];
}

/**
 * The friends of the logged user (packet FriendsList). The UI (bottom bar, friends window, avatar menu)
 * reads the state and subscribes to its changes; the friendships are kept by the messenger service.
 */
export class FriendsStore {
    private static instance: FriendsStore | null = null;

    private state: FriendsState = {friends: [], requests: [], sent: []};
    private listeners = new Set<(state: FriendsState) => void>();
    private requested = false;
    private profileUserId: number | null = null;

    static getInstance(): FriendsStore {
        if (!this.instance) this.instance = new FriendsStore();
        return this.instance;
    }

    get current(): FriendsState {
        return this.state;
    }

    /** @returns a function that removes the listener (e.g. when the component is unmounted). */
    subscribe(listener: (state: FriendsState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    update(state: Partial<FriendsState>): void {
        this.state = {
            friends: FriendsStore.sorted(state.friends ?? []),
            requests: state.requests ?? [],
            sent: state.sent ?? [],
        };

        this.listeners.forEach(listener => listener(this.state));
    }

    /** Asks the friend list once after the login (the server sends it again when it changes). */
    requestOnce(): void {
        if (this.requested) return;
        this.requested = true;

        FriendsStore.send(OutgoingPacket.GetFriendsInformationEvent);
    }

    isFriend(userId: number | null | undefined): boolean {
        return userId != null && this.state.friends.some(friend => friend.id === userId);
    }

    hasSentRequest(userId: number | null | undefined): boolean {
        return userId != null && this.state.sent.includes(userId);
    }

    hasRequestFrom(userId: number | null | undefined): boolean {
        return userId != null && this.state.requests.some(request => request.id === userId);
    }

    sendRequest(target: {userId?: number; username?: string}): void {
        FriendsStore.send(OutgoingPacket.FriendRequestEvent, target);
    }

    acceptRequest(userId: number): void {
        FriendsStore.send(OutgoingPacket.AcceptFriendRequestEvent, {userId});
    }

    declineRequest(userId: number): void {
        FriendsStore.send(OutgoingPacket.DeclineFriendRequestEvent, {userId});
    }

    removeFriend(userId: number): void {
        FriendsStore.send(OutgoingPacket.RemoveFriendEvent, {userId});
    }

    getFriend(userId: number | null | undefined): Friend | undefined {
        return userId == null ? undefined : this.state.friends.find(friend => friend.id === userId);
    }

    /** Enters the room where the friend is (the server answers why not, e.g. it's offline). */
    follow(userId: number): void {
        FriendsStore.send(OutgoingPacket.FollowFriendEvent, {userId});
    }

    /** The friend shown by the profile window. */
    get profileId(): number | null {
        return this.profileUserId;
    }

    openProfile(userId: number): void {
        this.profileUserId = userId;
        this.listeners.forEach(listener => listener(this.state));

        Engine.getInstance()?.userInterfaceManager?.componentsManager
            ?.getComponent<IComponentShowableUI>(UIComponent.FriendProfileUI)?.show();
    }

    /** Online friends first, then by name. */
    private static sorted(friends: Friend[]): Friend[] {
        return [...friends].sort((a, b) =>
            Number(b.online) - Number(a.online) || a.username.localeCompare(b.username));
    }

    private static send(packet: OutgoingPacket, body: object = {}): void {
        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(packet, body);
    }
}
