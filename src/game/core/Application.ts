import { Application, IApplicationOptions } from '@pixi/app'
import { Viewport } from 'pixi-viewport';
import { Container, Text, Ticker } from 'pixi.js';
import { Engine } from '../Engine';


export class ApplicationEngine extends Application {
    private _engine: Engine
    private _lastFrameTime: number
    private _timeElapsed: number = 0
    private _viewport: Viewport

    private debugInfoContainer: Container

    constructor(engine: Engine, options?: IApplicationOptions) {
        super(options);

        this.stage.interactive = true

        this.view.style.height = window.innerHeight + "px"
        this.view.style.width = window.innerWidth + "px"

        this.debugInfoContainer = new Container()

        this.setUpViewport()

        this._engine = engine
    }

    private setUpViewport() {
        this._viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,

            interaction: this.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        this._viewport.interactive = true

        this.stage.addChild(this._viewport)

        this._viewport.addChild(this.debugInfoContainer)

        this._viewport.drag({
            wheel: false
        })
    }

    public showDebugInfo(fps: number = this.ticker.FPS) {
        for(let children of this.debugInfoContainer.children) {
            this.debugInfoContainer.removeChild(children)
        }

        const fpsText = new Text(fps, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xff1010,
            align: 'center',
        });

        this.debugInfoContainer.addChild(fpsText)
    }

    public init(): void {
        this.setUpEvents()
        this.setUpGameLoop()
    }

    private setUpGameLoop(): void {
        let fpsInterval = 1000 / Engine.getInstance().config.fps
        this._lastFrameTime = Date.now()

        let gameLoop = () => {
            window.requestAnimationFrame(gameLoop)

            let currentTime = Date.now()

            this._timeElapsed = currentTime - this._lastFrameTime;

            if (this._lastFrameTime > fpsInterval) {
                this._engine.roomService.tick(this._timeElapsed)
                this._lastFrameTime = currentTime

                /*if(this._engine.config.debug) {
                    this.showDebugInfo()
                }*/
            }
        }

        gameLoop()
    }

    private setUpEvents(): void {
        window.requestAnimationFrame = (function () {
            return window.requestAnimationFrame ||
                (window as any).webkitRequestAnimationFrame ||
                (window as any).window.mozRequestAnimationFrame ||
                (window as any).window.oRequestAnimationFrame ||
                (window as any).window.msRequestAnimationFrame ||
                function (callback) {
                    let fpsInterval = 1000 / Engine.getInstance().config.fps
                    window.setTimeout(callback, fpsInterval);
                };
        })();

        window.onresize = () => this.onResize()
    }

    private onResize() {
        this.view.style.height = window.innerHeight + "px"
        this.view.style.width = window.innerWidth + "px"
    }

    public get viewport(): Viewport {
        return this._viewport
    }
}