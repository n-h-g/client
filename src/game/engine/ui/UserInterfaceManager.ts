import { Engine } from "../../Engine";
import { Logger } from "../../utils/Logger";
import { ComponentsManager } from "./components/ComponentsManager";
import { EventManager } from "./events/EventManager";
import { LoadProgressEvent } from "./events/LoadProgressEvent";
import { UIEvents } from "./events/UIEvents";
import SoundManager from "./sound/SoundManager";

export default class UserInterfaceManager {

    private _soundManager: SoundManager
    private _componentsManager: ComponentsManager;

    constructor() {

        this._componentsManager = new ComponentsManager()
        this._componentsManager.loadGameComponents()
        this._componentsManager.initGameComponents()

        this._soundManager = new SoundManager(this)
    }

    public get soundManager(): SoundManager {
        return this._soundManager
    }

    public async init(): Promise<void> {
        return Promise.all([
            /*(this._avatarImager.Data.loadGameData().then(() => {
                this._avatarImager.loadStructure()
            })),
            this.furniImager.init()*/
            //this._soundManager.loadAudioResources()
        ]).then(() => {
            /*EventManager.emit(UIEvents.LOAD, new LoadProgressEvent({
                width: 100,
                message: 'Completed'
            }))*/
        }).catch(err => {
            if (Engine.getInstance().config.debug) {
                Logger.error("UI initialization failed", err)
            }     
        }).finally(() => {
            //Engine.getInstance().networkingManager.setUpPingRequest()
        })

    }
}