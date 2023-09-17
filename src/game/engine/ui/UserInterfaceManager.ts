import {EventManager} from '../../core/events/EventManager';
import {Engine} from '../../Engine';
import {Logger} from '../../utils/Logger';
import {LoadingProgressEventData} from '../events/ui/data/loader/LoadingProgress';
import {UIEvents} from '../events/ui/UIEvents';
import {ComponentsManager} from './components/ComponentsManager';
import {AvatarImager} from './imagers/avatars/AvatarImager';
import {AvatarStructure} from './imagers/avatars/structure/AvatarStructure';
import {FurniImager} from './imagers/items/FurniImager';
import {RoomImager} from './imagers/room/RoomImager';
import {SoundManager} from './sound/SoundManager';

export class UserInterfaceManager {
    readonly soundManager: SoundManager;
    readonly componentsManager: ComponentsManager;
    readonly avatarStructure: AvatarStructure;
    readonly avatarImager: AvatarImager;
    readonly furniImager: FurniImager;
    readonly roomImager: RoomImager;

    private wrappedReady = false;

    constructor() {
        this.componentsManager = new ComponentsManager();

        if (!Engine.getInstance().config.offlineMode) {
            this.componentsManager.loadGameComponents();
            this.componentsManager.initGameComponents();
        }

        this.soundManager = new SoundManager(this);
        this.avatarStructure = new AvatarStructure();
        this.avatarImager = new AvatarImager(this.avatarStructure);
        this.furniImager = new FurniImager();
        this.roomImager = new RoomImager();
    }

    async init(): Promise<void> {
        try {
            await this.avatarImager.Data.loadGameData(),
                this.avatarImager.loadStructure();
            await this.furniImager.init();

            this.wrappedReady = true;

            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 20,
                message: 'Assets loaded',
            });
        } catch (e) {
            this.wrappedReady = false;

            Logger.error(e);

            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 20,
                message: 'Failed assets loading',
            });
        }
    }

    get ready(): boolean {
        return this.wrappedReady;
    }
}
