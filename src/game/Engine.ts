import { ApplicationEngine } from './core/Application'
import RoomManager from './engine/room/RoomManager'
import Point from './utils/point/Point'

import generalConfig from './configuration/general.json'

export class Engine {
    private static _instance: Engine | null
    private _application: ApplicationEngine | null

    public config = generalConfig


    public static getInstance(): Engine {
        if (Engine._instance == null) {
            Engine._instance = new Engine()
        }
        return Engine._instance
    }

    public init(): void {
        if (!Engine._instance) {
            Engine._instance = this
        }

        console.log("%cNHG React v1.0.0", "font-size:2rem; background-color:#069; color:#fff; padding:10px 45px;")

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

        let room = new RoomManager()
        room.setRoom('prova', '111111/11100111/11100111', new Point(1, 1), 1)
    }

    public get application(): ApplicationEngine {
        return this._application || null
    }
}