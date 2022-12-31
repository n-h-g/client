import { Application, IApplicationOptions } from '@pixi/app'
import { Engine } from '../Engine';

export class ApplicationEngine extends Application {

    private engine: Engine;

    private lastFrameTime: number = 0

    private timeElapsed: number = 0

    constructor(engine: Engine, options?: IApplicationOptions) {
        super(options);

        this.stage.interactive = true

        this.view.style.height = window.innerHeight + "px"
        this.view.style.width = window.innerWidth + "px"

        this.engine = engine
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
    }
}