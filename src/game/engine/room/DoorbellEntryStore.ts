import {Engine} from '../../Engine';
import {EventManager} from '../../core/events/EventManager';
import {IComponentShowableUI} from '../../core/ui/IComponentShowableUI';
import {OutgoingPacket} from '../../networking/packets/outgoing/OutgoingPacket';
import {DialogEventData} from '../events/ui/data/general/Dialog';
import {UIEvents} from '../events/ui/UIEvents';
import {UIEventsType} from '../events/ui/UIEventsType';
import {UIComponent} from '../ui/components/UIComponent';

/** The door of a room with the doorbell, for the user outside: "locked" (ring?) or "waiting" (it rang). */
export interface DoorbellEntry {
    roomId: number;
    name: string;
    state: 'locked' | 'waiting';
}

/**
 * The user at the door of a room with the doorbell (the server says when: DoorbellState). Its window asks to ring
 * (ringing, the user leaves the room where it is), then waits for someone inside to open; Cancel stops waiting.
 */
export class DoorbellEntryStore {
    private static instance: DoorbellEntryStore | null = null;

    private entry: DoorbellEntry | null = null;
    private listeners = new Set<(entry: DoorbellEntry | null) => void>();

    static getInstance(): DoorbellEntryStore {
        if (!this.instance) this.instance = new DoorbellEntryStore();
        return this.instance;
    }

    private constructor() {
        // the close icon of the window: as Cancel
        EventManager.read(UIEvents.CLOSE, (data: DialogEventData) => {
            if (data.type === UIEventsType.DOORBELL_ENTRY) this.cancel();
        });
    }

    get current(): DoorbellEntry | null {
        return this.entry;
    }

    /** @returns a function that removes the listener. */
    subscribe(listener: (entry: DoorbellEntry | null) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /** From the server: "closed" (let in, declined, nobody to open) closes the window. */
    update(data: {roomId: number; name?: string; state: string}): void {
        if (data.state !== 'locked' && data.state !== 'waiting') {
            this.set(null);
            return;
        }

        this.set({roomId: data.roomId, name: data.name ?? '', state: data.state});
    }

    /** Rings the doorbell: out of the room where the user is, to wait at the door. */
    ring(): void {
        const entry = this.entry;
        const engine = Engine.getInstance();
        if (!entry || entry.state !== 'locked' || !engine) return;

        const room = engine.roomService?.currentRoom;
        if (room) {
            engine.networkingManager?.packetManager.applyOut(OutgoingPacket.UserExitRoom, {id: room.id});
            engine.roomService.leaveRoom();
        }

        engine.networkingManager?.packetManager.applyOut(OutgoingPacket.UserEnterRoom, {id: entry.roomId, ring: true});
    }

    /** Doesn't ring, or doesn't wait anymore. */
    cancel(): void {
        if (this.entry?.state === 'waiting') {
            Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.DoorbellCancelEvent, {});
        }

        this.set(null);
    }

    private set(entry: DoorbellEntry | null): void {
        this.entry = entry;
        this.listeners.forEach(listener => listener(entry));

        const window = Engine.getInstance()?.userInterfaceManager?.componentsManager
            ?.getComponent<IComponentShowableUI>(UIComponent.DoorbellEntryUI);

        if (entry) window?.show();
        else window?.hide();
    }
}
