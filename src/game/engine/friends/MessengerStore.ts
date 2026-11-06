import {Engine} from '../../Engine';
import {OutgoingPacket} from '../../networking/packets/outgoing/OutgoingPacket';
import {IComponentShowableUI} from '../../core/ui/IComponentShowableUI';
import {UIComponent} from '../ui/components/UIComponent';

export interface PrivateMessage {
    /** Sent by the logged user, else by the friend. */
    own: boolean;
    text: string;
    time: Date;
}

export interface Conversation {
    friendId: number;
    messages: PrivateMessage[];
    unread: boolean;
}

export interface MessengerState {
    /** The open chats, by the order they were opened. */
    conversations: Conversation[];
    /** The chat shown by the messenger window. */
    activeId: number | null;
    /** The messenger window is open. */
    open: boolean;
}

/**
 * The private chats with the friends (Habbo's messenger). The messages are kept for the session:
 * the server only delivers them to the online friends.
 */
export class MessengerStore {
    private static instance: MessengerStore | null = null;

    private state: MessengerState = {conversations: [], activeId: null, open: false};
    private listeners = new Set<(state: MessengerState) => void>();

    static getInstance(): MessengerStore {
        if (!this.instance) this.instance = new MessengerStore();
        return this.instance;
    }

    get current(): MessengerState {
        return this.state;
    }

    get hasUnread(): boolean {
        return this.state.conversations.some(conversation => conversation.unread);
    }

    /** @returns a function that removes the listener. */
    subscribe(listener: (state: MessengerState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /** Opens the messenger on the chat with the friend (e.g. from the friend bar). */
    openChat(friendId: number): void {
        this.conversation(friendId);
        this.state.activeId = friendId;
        this.markRead(friendId);
        this.setOpen(true);
    }

    /** Opens the messenger on the last chat (the bottom bar button). */
    toggle(): void {
        if (this.state.open) {
            this.setOpen(false);
            return;
        }

        const unread = this.state.conversations.find(conversation => conversation.unread);
        const active = unread ?? this.state.conversations.find(c => c.friendId === this.state.activeId)
            ?? this.state.conversations[this.state.conversations.length - 1];

        if (active) this.openChat(active.friendId);
    }

    select(friendId: number): void {
        this.state.activeId = friendId;
        this.markRead(friendId);
        this.changed();
    }

    closeChat(friendId: number): void {
        const conversations = this.state.conversations.filter(c => c.friendId !== friendId);
        const activeId = this.state.activeId === friendId
            ? conversations[conversations.length - 1]?.friendId ?? null
            : this.state.activeId;

        this.state = {...this.state, conversations, activeId};

        if (conversations.length === 0) this.setOpen(false);
        else this.changed();
    }

    send(friendId: number, text: string): void {
        const message = text.trim();
        if (!message) return;

        // shown when the server sends it back (filtered by the messenger service)
        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.FriendPrivateMessageEvent, {
            userId: friendId,
            text: message,
        });
    }

    /** A message from the server (packet FriendMessage), sent or received by the logged user. */
    receive(fromId: number, toId: number, text: string): void {
        const own = fromId === Engine.getInstance()?.currentUserId;
        const friendId = own ? toId : fromId;

        const conversation = this.conversation(friendId);
        conversation.messages.push({own, text, time: new Date()});

        if (!own && !(this.state.open && this.state.activeId === friendId)) conversation.unread = true;
        if (this.state.activeId == null) this.state.activeId = friendId;

        this.changed();
    }

    /** The window was closed (its close button). */
    setOpen(open: boolean): void {
        if (this.state.open === open) {
            this.changed();
            return;
        }

        this.state.open = open;
        this.changed();

        const component = Engine.getInstance()?.userInterfaceManager?.componentsManager
            ?.getComponent<IComponentShowableUI>(UIComponent.PrivateChatUI);
        if (open) component?.show();
        else component?.hide();
    }

    private markRead(friendId: number): void {
        const conversation = this.state.conversations.find(c => c.friendId === friendId);
        if (conversation) conversation.unread = false;
    }

    private conversation(friendId: number): Conversation {
        let conversation = this.state.conversations.find(c => c.friendId === friendId);

        if (!conversation) {
            conversation = {friendId, messages: [], unread: false};
            this.state.conversations.push(conversation);
        }

        return conversation;
    }

    private changed(): void {
        // a new object: the Vue refs see the change
        this.state = {...this.state, conversations: [...this.state.conversations]};
        this.listeners.forEach(listener => listener(this.state));
    }
}
