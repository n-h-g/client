import {Engine} from '../../Engine';
import {IComponentShowableUI} from '../../core/ui/IComponentShowableUI';
import {OutgoingPacket} from '../../networking/packets/outgoing/OutgoingPacket';
import {UIComponent} from '../ui/components/UIComponent';

/** A user that rang the doorbell of the room. */
export interface DoorbellRequest {
    id: number;
    username: string;
    look: string;
}

const SOUND_KEY = 'doorbell_sound';

/**
 * The users waiting at the doorbell of the current room (for the users with rights inside). A new request opens
 * the Doorbell window and rings (if the sound is on); the window answers them.
 */
export class DoorbellStore {
    private static instance: DoorbellStore | null = null;

    private requests: DoorbellRequest[] = [];
    private listeners = new Set<(requests: DoorbellRequest[]) => void>();
    private audio: AudioContext | null = null;

    static getInstance(): DoorbellStore {
        if (!this.instance) this.instance = new DoorbellStore();
        return this.instance;
    }

    get current(): DoorbellRequest[] {
        return this.requests;
    }

    /** @returns a function that removes the listener. */
    subscribe(listener: (requests: DoorbellRequest[]) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    add(request: DoorbellRequest): void {
        if (this.requests.some(other => other.id === request.id)) return;

        this.set([...this.requests, request]);
        this.window()?.show();

        if (this.soundOn) this.ring();
    }

    remove(id: number): void {
        this.set(this.requests.filter(request => request.id !== id));
    }

    /** Out of the room: the requests were for it. */
    clear(): void {
        this.set([]);
    }

    answer(id: number, accept: boolean): void {
        Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.DoorbellAnswerEvent, {
            userId: id,
            accept,
        });
        this.remove(id);
    }

    answerAll(accept: boolean): void {
        for (const request of [...this.requests]) this.answer(request.id, accept);
    }

    get soundOn(): boolean {
        try {
            return localStorage.getItem(SOUND_KEY) !== 'off';
        } catch {
            return true;
        }
    }

    set soundOn(on: boolean) {
        try {
            localStorage.setItem(SOUND_KEY, on ? 'on' : 'off');
        } catch {
            // the setting stays for this session only
        }
    }

    /** A "ding-dong", drawn with the Web Audio API (no sound file). */
    private ring(): void {
        try {
            this.audio ??= new AudioContext();
            const audio = this.audio;

            [[659, 0], [523, 0.32]].forEach(([frequency, delay]) => {
                const oscillator = audio.createOscillator();
                const gain = audio.createGain();
                const start = audio.currentTime + delay;

                oscillator.type = 'sine';
                oscillator.frequency.value = frequency;
                gain.gain.setValueAtTime(0.0001, start);
                gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);

                oscillator.connect(gain).connect(audio.destination);
                oscillator.start(start);
                oscillator.stop(start + 0.95);
            });
        } catch {
            // e.g. no audio in the browser: the window is enough
        }
    }

    private set(requests: DoorbellRequest[]): void {
        this.requests = requests;
        this.listeners.forEach(listener => listener(this.requests));

        // the last one was answered (here or by someone else) or went away: nothing left to answer
        if (requests.length === 0) this.window()?.hide();
    }

    private window(): IComponentShowableUI | undefined {
        return Engine.getInstance()?.userInterfaceManager?.componentsManager
            ?.getComponent<IComponentShowableUI>(UIComponent.DoorbellUI);
    }
}
