import { ApplicationEngine } from './core/Application'
import RoomManager from './engine/room/RoomManager'
import Point from './utils/point/Point'
import generalConfig from './configuration/general.json'
import { ComponentsManager } from './engine/ui/components/ComponentsManager'
import { NetworkingManager } from './networking/NetworkingManager'
import { EventManager } from './engine/ui/events/EventManager'
import { LoadProgressEvent } from './engine/ui/events/LoadProgressEvent'
import { Logger } from './utils/Logger'
import UserInterfaceManager from './engine/ui/UserInterfaceManager'

export class Engine {
    private static _instance: Engine
    private _application: ApplicationEngine | null
    private _userInterfaceManager: UserInterfaceManager | null
    private _roomsManager: RoomManager | null
    private _networkingManager: NetworkingManager | null
    private _config = generalConfig

    private _sso: string;

    public static getInstance(): Engine {
        return this._instance
    }

    public async init(): Promise<void> {
        if (!Engine._instance) {
            Engine._instance = this
        }

        console.log("%cNHG Client v" + this._config.version, "font-size:2rem; background-color:#069; color:#fff; padding:10px 45px;")

        this._application = new ApplicationEngine({
            backgroundColor: 0x00000,
            backgroundAlpha: 1,
            antialias: true,
            resolution: window.devicePixelRatio,
            width: window.innerWidth,
            height: window.innerHeight,
            powerPreference: "high-performance",
            resizeTo: window
        })

        this._networkingManager = new NetworkingManager()
        this._userInterfaceManager = new UserInterfaceManager()

        this.application.view.style.height = window.innerHeight + "px";
        this.application.view.style.width = window.innerWidth + "px";

        document.body.appendChild(this._application.view)

        this._application.stage.interactive = true

        await this.userInterfaceManager.init()

        if(this._config.offlineMode) {
            this._roomsManager = new RoomManager()
            this._roomsManager.setRoom('prova', '111111/11100111/11100111', new Point(1, -1), 1)
        }
    }

    public get config(): typeof generalConfig {
        return this._config;
    }

    public set sso(sso: string) {
        this._sso = sso
    }

    public get sso(): string {
        return this._sso
    }

    public get application(): ApplicationEngine {
        return this._application || null
    }

    public get userInterfaceManager(): UserInterfaceManager {
        return this._userInterfaceManager
    }

    public get networkingManager(): NetworkingManager {
        return this._networkingManager
    }
}