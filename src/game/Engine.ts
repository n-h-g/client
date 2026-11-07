import {ApplicationEngine} from './core/Application';
import {RoomService} from './engine/room/RoomService';
import {config, GeneralConfig} from './configuration/Configuration';
import {NetworkingManager} from './networking/NetworkingManager';
import {UserInterfaceManager} from './engine/ui/UserInterfaceManager';
import {CommandService} from './engine/game/commands/CommandService';
import * as PIXI from 'pixi.js';
import {OfflineMode} from './offline/OfflineMode';
import {ChatMessageService} from './engine/game/chat/ChatService';
import {Logger} from './utils/Logger';

export class Engine {
	lastFrameTime: number;
    timeElapsed: number;
    currentUserId: number | null = null;

    private static instance: Engine;

    private wrappedApplication: ApplicationEngine;
    private wrappedUserInterfaceManager: UserInterfaceManager;
    private wrappedRoomsService: RoomService;
    private wrappedNetworkingManager: NetworkingManager;
    private wrappedCommandService: CommandService;
    private wrappedChatService: ChatMessageService;
    private wrappedConfig = config;
    private wrappedSSO: string;

    static getInstance(): Engine {
        return this.instance;
    }

    async init(): Promise<void> {
        if (!Engine.instance) {
            Engine.instance = this;
        }

        PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;
        PIXI.settings.ROUND_PIXELS = true;
        PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = true;

        console.log(
            '%cNHG Client v' + this.wrappedConfig.version,
            'font-size:2rem; background-color:#069; color:#fff; padding:10px 45px;'
        );

        this.wrappedApplication = new ApplicationEngine(this, {
            backgroundColor: 0x000000,
            backgroundAlpha: 1,
            antialias: true,
            // the density of the screen (e.g. 1.25/1.5 on a Linux desktop scaled, 2 on a Retina): with 1 the canvas
            // was drawn at low resolution and scaled up by the browser, blurred
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            width: window.innerWidth,
            height: window.innerHeight,
            resizeTo: window,
        });

        document.body.appendChild(this.application.view);

        this.wrappedRoomsService = new RoomService();
        this.wrappedCommandService = new CommandService();
        this.wrappedChatService = new ChatMessageService();

        this.application.init();

        this.wrappedUserInterfaceManager = new UserInterfaceManager();
        await this.wrappedUserInterfaceManager.init();

        if (this.wrappedConfig.offlineMode) {
            try {
                new OfflineMode(this).init().catch(err => {
                    throw err;
                });
            } catch (e) {
                throw new e();
            }
        } else {
            this.wrappedNetworkingManager = new NetworkingManager();
        }

        if (this.wrappedConfig.debug) {
            (window as any).nhg = this;
        }
    }
    get config(): GeneralConfig {
        return this.wrappedConfig;
    }

    set sso(sso: string) {
        this.wrappedSSO = sso;
    }

    get sso(): string {
        return this.wrappedSSO;
    }

    get application(): ApplicationEngine {
        return this.wrappedApplication;
    }

    get commandService(): CommandService {
        return this.wrappedCommandService;
    }
    get roomService(): RoomService {
        return this.wrappedRoomsService;
    }

    get userInterfaceManager(): UserInterfaceManager {
        return this.wrappedUserInterfaceManager;
    }

    get chatService(): ChatMessageService {
        return this.wrappedChatService;
    }

    get networkingManager(): NetworkingManager {
        return this.wrappedNetworkingManager;
    }
}
