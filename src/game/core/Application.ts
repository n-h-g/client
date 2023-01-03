import { Application, IApplicationOptions } from '@pixi/app'
import { Viewport } from 'pixi-viewport';
import { DisplayObject } from 'pixi.js';
import { Engine } from '../Engine';

export class ApplicationEngine extends Application {

    private engine: Engine;

    private lastFrameTime: number = 0

    private timeElapsed: number = 0

    private _viewport: Viewport

    constructor(engine: Engine, options?: IApplicationOptions) {
        super(options);

        this.stage.interactive = true

        this.view.style.height = window.innerHeight + "px"
        this.view.style.width = window.innerWidth + "px"

        this.setUpViewport()

        this.engine = engine
    }

    private setUpViewport() {
        this._viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
        
            interaction: this.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
        })

        this.stage.addChild(this._viewport)

        this._viewport.drag()
        
    }

    /**
     * Add a display object to viewport
     * @param object 
     */
    public add(object: DisplayObject) {
        this._viewport.addChild(object)

    }

    public init(): void {
        this.setUpEvents()
        this.setUpGameLoop()
    }

    private setUpGameLoop(): void {
        let fpsInterval = 1000 / Engine.getInstance().config.fps
        this.lastFrameTime = Date.now()

        let gameLoop = () => {
            window.requestAnimationFrame(gameLoop)
            
            let currentTime = Date.now()

            this.timeElapsed = currentTime - this.lastFrameTime; 

            if (this.timeElapsed > fpsInterval) {
                this.engine.roomService.tick(this.timeElapsed)
                this.engine.usersService.tick(this.timeElapsed)

                this.lastFrameTime = currentTime //- (this.timeElapsed % fpsInterval)
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