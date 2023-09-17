import {UserInterfaceManager} from '../UserInterfaceManager';
import {SoundResource} from './SoundResource';
import {Sound} from './SoundEnum';
import {Engine} from '../../../Engine';

export class SoundManager {
    private userInterfaceManager: UserInterfaceManager;
    private audioResourceFolder: string;
    private sounds: Map<Sound, SoundResource> = new Map();

    constructor(userInterfaceManager: UserInterfaceManager) {
        this.userInterfaceManager = userInterfaceManager;

        this.audioResourceFolder =
            Engine.getInstance().config.soundResourcesUrl;
    }

    loadAudioResources(): void {
        Object.values(Sound).forEach(sound => {
            this.sounds.set(sound, new SoundResource(this, sound));
        });
    }

    play(soundName: Sound) {
        const sound = this.sounds.get(soundName);

        if (sound != undefined) sound.play();
    }

    getResourceFolder(): string {
        return this.audioResourceFolder;
    }

    getUserInterfaceManager(): UserInterfaceManager {
        return this.userInterfaceManager;
    }
}
