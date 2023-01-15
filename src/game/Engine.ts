import { ApplicationEngine } from './core/Application'
import RoomService from './engine/room/RoomService'
import Point from './utils/point/Point'
import generalConfig from './configuration/general.json'
import { NetworkingManager } from './networking/NetworkingManager'
import { UserInterfaceManager } from './engine/ui/UserInterfaceManager'
import { CommandService } from './engine/game/commands/CommandService'
import Room from './engine/room/Room'
import * as PIXI from "pixi.js"
import { UserEntity } from './engine/room/objects/users/UserEntity'
import { Direction } from './core/objects/Direction'
import UserEntityVisualization from './engine/room/objects/users/visualization/UserEntityVisualization'
import { ActionId } from './engine/ui/imagers/avatars/enum/actions/ActionId'
import { ItemType } from './engine/ui/imagers/items/FurniImager'
import RoomVisualization from './engine/room/visualization/RoomVisualization'
import FloorItem from './engine/room/objects/items/FloorItem'
import Point3d from './utils/point/Point3d'
import { EventManager } from './core/events/EventManager'
import { LoadingProgressEventData } from './engine/events/ui/data/loader/LoadingProgress'
import { UIEvents } from './engine/events/ui/UIEvents'
import { OfflineMode } from './offline/OfflineMode'

export class Engine {
    private static _instance: Engine
    private _application: ApplicationEngine | null
    private _userInterfaceManager: UserInterfaceManager | null
    private _roomsService: RoomService | null
    private _networkingManager: NetworkingManager | null
    private _commandService: CommandService | null

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

        PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;
        PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = true;

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

        this._networkingManager = new NetworkingManager()
        this._userInterfaceManager = new UserInterfaceManager()
        await this._userInterfaceManager.init()

        EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
            width: 100,
            message: 'Logged'
        })

        this.application.init()

        if(this._config.debug) {
            (window as any).engine = this
        }

        //0000000000000000000000000/0000000000044444444444444/0000000000044444444444444/0000000000044444444444444/0000000000444444444444444/0000000000044444444444444/0000000000044444444444444/0000000444444444444444444/0000000444444444444444444/0000000444444444444444444/0000000444444444444444444/0000000444444444444444444/0000000444444444444444444/0555554444400000000000000/0555554444400000000000000/0555554444443330011111100/0555554444443330011111100/0005500000000330011111100/0004400000000220011111100/0004443333332222111111100/0004443333332222111111100/0000000000000000011111100/0000000000000000011111100/0000000000000000011111100/0000000000000000011111100/0000000000000000000000000
        //00000000000000000000000000000/03333333333333333333333333330/03333333333333333333333333330/33333333333333333333333333330/03333333333333333333333333330/03333000000333333000000033330/03333000000222222000000033330/03333002222222222222220033330/03333002222222222222220033330/03333002200022220000220033330/03333002200011110000220033330/03333322201111111100220033330/03333322201111111100220033330/03333322201111111100220033330/03333322201111111100220033330/03333322201111111100220033330/03333322201111111100220033330/03333002200000000000220033330/03333002200000000000220033330/03333002222222222222220033330/03333002222222222222220033330/03333000000000000000000033330/03333000000000000000000033330/03333333333333333333333333330/03333333333333333333333333330/03333333333333333333333333330/03333333333333333333333333330/00000000000000000000000000000
        if (this._config.offlineMode) {
            new OfflineMode(this).init()
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

    public get commandService(): CommandService {
        return this._commandService
    }
    public get roomService(): RoomService {
        return this._roomsService
    }

    public get userInterfaceManager(): UserInterfaceManager {
        return this._userInterfaceManager
    }

    public get networkingManager(): NetworkingManager {
        return this._networkingManager
    }
}