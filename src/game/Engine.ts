import { ApplicationEngine } from './core/Application'
import RoomService from './engine/room/RoomService'
import Point from './utils/point/Point'
import generalConfig from './configuration/general.json'
import { NetworkingManager } from './networking/NetworkingManager'
import UserInterfaceManager from './engine/ui/UserInterfaceManager'
import UserService from './engine/user/UserService'
import CommandService from './engine/game/commands/CommandService'
import ChatMessageService from './engine/game/chat/ChatMessageService'
import Room from './engine/room/Room'

export class Engine {
    private static _instance: Engine
    private _application: ApplicationEngine | null
    private _userInterfaceManager: UserInterfaceManager | null
    private _roomsService: RoomService | null
    private _networkingManager: NetworkingManager | null
    private _usersService: UserService | null
    private _commandService: CommandService | null
    private _chatService: ChatMessageService | null

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

        this._application.view.style.height = window.innerHeight + "px";
        this._application.view.style.width = window.innerWidth + "px";

        document.body.appendChild(this._application.view)

        this._application.stage.interactive = true

        await this.userInterfaceManager.init()

        this._roomsService = new RoomService()
        this._usersService = new UserService()
        this._commandService = new CommandService()
        this._chatService = new ChatMessageService()

        if(this._config.offlineMode) {
            let room: Room = this._roomsService.setRoom('prova', '111111/11100111/11100111', new Point(1, -1), 1)
            room.getRoomLayout().Visualization.render()
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

    public get chatService(): ChatMessageService {
        return this._chatService
    }

    public get commandService(): CommandService {
        return this._commandService
    }

    public get usersService(): UserService {
        return this._usersService
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