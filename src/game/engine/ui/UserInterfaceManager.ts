import { Engine } from "../../Engine";
import { Logger } from "../../utils/Logger";
import { ComponentsManager } from "./components/ComponentsManager";
import { EventManager } from "./events/EventManager";
import { LoadProgressEvent } from "./events/LoadProgressEvent";
import { UIEvents } from "./events/UIEvents";
import AvatarImager from "./imagers/avatars/AvatarImager";
import AvatarStructure from "./imagers/avatars/structure/AvatarStructure";
import FurniImager from "./imagers/items/FurniImager";
import SoundManager from "./sound/SoundManager";

export default class UserInterfaceManager {

    private _soundManager: SoundManager
    private _componentsManager: ComponentsManager;
    private _avatarStructure: AvatarStructure
    private _avatarImager: AvatarImager
    private _furniImager: FurniImager

    constructor() {

        this._componentsManager = new ComponentsManager()
        this._componentsManager.loadGameComponents()
        this._componentsManager.initGameComponents()

        this._soundManager = new SoundManager(this)
        this._avatarStructure = new AvatarStructure();
        this._avatarImager = new AvatarImager(this._avatarStructure)
        this._furniImager = new FurniImager()
    }

    public get soundManager(): SoundManager {
        return this._soundManager
    }

    public async init(): Promise<void> {
        return Promise.all([
            (this._avatarImager.Data.loadGameData().then(() => {
                this._avatarImager.loadStructure()
            }).catch((err => {
                if (Engine.getInstance().config.debug) {
                    Logger.error("Avatar UI GameData initialization failed")
                }   
            })),
            this._furniImager.init()
        )]).then(() => {
            EventManager.emit(UIEvents.LOAD, new LoadProgressEvent({
                width: 20,
                message: 'Assets loaded'
            }))
        }).catch(err => {
            if (Engine.getInstance().config.debug) {
                Logger.error("UI initialization failed", err)
            }     
        })

    }

    public get avatarStructure(): AvatarStructure {
        return this._avatarStructure
    }

    public get avatarImager(): AvatarImager {
        return this._avatarImager
    }
}