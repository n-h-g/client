import { EventManager } from '../../core/events/EventManager'
import { Engine } from '../../Engine'
import { Logger } from '../../utils/Logger'
import { LoadingProgressEventData } from '../events/ui/data/loader/LoadingProgress'
import { UIEvents } from '../events/ui/UIEvents'
import { ComponentsManager } from './components/ComponentsManager'
import AvatarImager from './imagers/avatars/AvatarImager'
import AvatarStructure from './imagers/avatars/structure/AvatarStructure'
import FurniImager from './imagers/items/FurniImager'
import { RoomImager } from './imagers/room/RoomImager'
import SoundManager from './sound/SoundManager'

export class UserInterfaceManager {
    private _soundManager: SoundManager
    private _componentsManager: ComponentsManager
    private _avatarStructure: AvatarStructure
    private _avatarImager: AvatarImager
    private _furniImager: FurniImager
    private _roomImager: RoomImager

    private _ready: boolean = false

    constructor() {
        this._componentsManager = new ComponentsManager()

        if(!Engine.getInstance().config.offlineMode) {
            this._componentsManager.loadGameComponents()
             this._componentsManager.initGameComponents()
        }

        this._soundManager = new SoundManager(this)
        this._avatarStructure = new AvatarStructure()
        this._avatarImager = new AvatarImager(this._avatarStructure)
        this._furniImager = new FurniImager()
        this._roomImager = new RoomImager()
    }

    public async init(): Promise<void> {
        try {
            await this._avatarImager.Data.loadGameData(),
            this._avatarImager.loadStructure()
            await this._furniImager.init()

            this._ready = true;

            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 50,
                message: 'Logged'
            })
             
        } catch(e) {
            this._ready = false;

            Logger.error(e)

            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 0,
                message: 'Assets loading failed'
            })
        }
    }

    public get soundManager(): SoundManager {
        return this._soundManager
    }

    public get componentsManager(): ComponentsManager {
        return this._componentsManager
    }

    public get furniImager(): FurniImager {
        return this._furniImager
    }

    public get roomImager(): RoomImager {
        return this._roomImager
    }

    public get avatarStructure(): AvatarStructure {
        return this._avatarStructure
    }

    public get avatarImager(): AvatarImager {
        return this._avatarImager
    }

    public get ready(): boolean {
        return this._ready;
    }
}