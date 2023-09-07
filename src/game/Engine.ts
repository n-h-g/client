import { ApplicationEngine } from './core/Application'
import RoomService from './engine/room/RoomService'
import generalConfig from './configuration/general.json'
import { NetworkingManager } from './networking/NetworkingManager'
import { UserInterfaceManager } from './engine/ui/UserInterfaceManager'
import { CommandService } from './engine/game/commands/CommandService'
import * as PIXI from "pixi.js"
import { OfflineMode } from './offline/OfflineMode'
import ChatMessageService from './engine/game/chat/ChatService'

export class Engine {
    private static _instance: Engine
    private _application: ApplicationEngine
    private _userInterfaceManager: UserInterfaceManager
    private _roomsService: RoomService
    private _networkingManager: NetworkingManager
    private _commandService: CommandService
    private _chatService: ChatMessageService

    private _config = generalConfig

    private _sso: string;
    lastFrameTime: number
    timeElapsed: number

    public static getInstance(): Engine {
        return this._instance
    }

    public async init(): Promise<void> {
        if (!Engine._instance) {
            Engine._instance = this
        }

        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST
        PIXI.settings.ROUND_PIXELS = true
        PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = true

        console.log("%cNHG Client v" + this._config.version, "font-size:2rem; background-color:#069; color:#fff; padding:10px 45px;")

        this._application = new ApplicationEngine(this, {
            backgroundColor: 0x00000,
            backgroundAlpha: 1,
            antialias: true,
            resolution: window.devicePixelRatio,
            width: window.innerWidth,
            height: window.innerHeight,
            powerPreference: "high-performance",
            resizeTo: window
        })

        document.body.appendChild(this._application.view)

        this._roomsService = new RoomService()
        this._commandService = new CommandService()
        this._chatService = new ChatMessageService()

        this._application.init()

        this._userInterfaceManager = new UserInterfaceManager()
        await this._userInterfaceManager.init()
        if (this._config.offlineMode) {
            try {
                (new OfflineMode(this).init().catch((err) =>{
                    throw err;
                }))
            } catch(e) {
                throw new e;
            }
        } else {
            this._networkingManager = new NetworkingManager();
        }

        if (this._config.debug) {
            (window as any).nhg = this
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
        return this._application
    }

    public get commandService(): CommandService {
        return this._commandService
    }
    public get roomService(): RoomService {
        return this._roomsService
    }

    public get userInterfaceManager(): UserInterfaceManager {
        return this._userInterfaceManager
    }

    public get chatService(): ChatMessageService {
        return this._chatService;
    }

    public get networkingManager(): NetworkingManager {
        return this._networkingManager
    }
}