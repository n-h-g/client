import { ApplicationEngine } from './core/Application'
import RoomManager from './engine/room/RoomManager'
import Point from './utils/point/Point'
import generalConfig from './configuration/general.json'
import { ComponentsManager } from './engine/ui/ComponentsManager'
import { NetworkingManager } from './networking/NetworkingManager'

export class Engine {
    private static _instance: Engine
    private _application: ApplicationEngine | null
    private _componentsManager: ComponentsManager | null
    private _roomsManager: RoomManager | null
    private _networkingManager: NetworkingManager | null
    private _config = generalConfig

    public static getInstance(): Engine {
        return this._instance
    }

    public init(): void {
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

        this.application.view.style.height = window.innerHeight + "px";
        this.application.view.style.width = window.innerWidth + "px";

        document.body.appendChild(this._application.view)

        this._application.stage.interactive = true

        this._componentsManager = new ComponentsManager()
        this._componentsManager.loadGameComponents()
        this._componentsManager.initGameComponents()

        this._networkingManager = new NetworkingManager();

        this._roomsManager = new RoomManager()
        this._roomsManager.setRoom('prova', '111111/11100111/11100111', new Point(1, -1), 1)
    }

    public get config(): typeof generalConfig {
        return this._config;
    }

    public get application(): ApplicationEngine {
        return this._application || null
    }

    public get componentsManager(): ComponentsManager {
        return this._componentsManager
    }

    public get networkingManager(): NetworkingManager {
        return this._networkingManager
    }
}