import {Viewport} from 'pixi-viewport';
import {
    Container,
    Point,
    Text,
    Application,
    IApplicationOptions,
} from 'pixi.js';
import {Engine} from '../Engine';

export class ApplicationEngine extends Application<HTMLCanvasElement> {
    private engine: Engine;
    private lastFrameTime: number;
    private timeElapsed = 0;
    private wrappedViewport: Viewport;
    private debugInfoContainer: Container;
    private wrappedScreenCoords: Point;

    constructor(engine: Engine, options?: Partial<IApplicationOptions>) {
        super(options);

        this.stage.eventMode = 'dynamic';

        this.view.style.height = window.innerHeight + 'px';
        this.view.style.width = window.innerWidth + 'px';

        this.debugInfoContainer = new Container();

        this.setUpViewport();

        this.engine = engine;
    }

    setUpViewport() {
        if (this.wrappedViewport != null) this.wrappedViewport.destroy();

        this.wrappedViewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            events: this.renderer.events,
        });

        this.wrappedViewport.eventMode = 'dynamic';

        this.stage.addChild(this.wrappedViewport);

        this.stage.addChild(this.debugInfoContainer);

        this.wrappedScreenCoords = new Point(
            window.innerWidth,
            window.innerHeight
        );

        this.wrappedViewport.drag({
            wheel: false,
        });
    }

    showDebugInfo(fps: number = this.ticker.FPS) {
        for (const children of this.debugInfoContainer.children) {
            this.debugInfoContainer.removeChild(children);
        }

        const fpsText = new Text(fps, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xff1010,
            align: 'center',
        });

        this.debugInfoContainer.addChild(fpsText);
    }

    init(): void {
        this.setUpEvents();
        this.setUpGameLoop();
    }

    private setUpGameLoop(): void {
        const fpsInterval = 1000 / Engine.getInstance().config.fps;
        this.lastFrameTime = Date.now();

        const gameLoop = () => {
            window.requestAnimationFrame(gameLoop);

            const currentTime = Date.now();

            this.timeElapsed = currentTime - this.lastFrameTime;

            if (this.lastFrameTime > fpsInterval) {
                this.engine.roomService.tick(this.timeElapsed);
                this.lastFrameTime = currentTime;

                if (this.engine.config.debug) {
                    this.showDebugInfo();
                }
            }
        };

        gameLoop();
    }

    private setUpEvents(): void {
        window.requestAnimationFrame = (function () {
            return (
                window.requestAnimationFrame ||
                (window as any).webkitRequestAnimationFrame ||
                (window as any).window.mozRequestAnimationFrame ||
                (window as any).window.oRequestAnimationFrame ||
                (window as any).window.msRequestAnimationFrame ||
                function (callback) {
                    const fpsInterval = 1000 / Engine.getInstance().config.fps;
                    window.setTimeout(callback, fpsInterval);
                }
            );
        })();

        window.onresize = () => this.onResize();
    }

    private onResize() {
        this.view.style.height = window.innerHeight + 'px';
        this.view.style.width = window.innerWidth + 'px';

        this.renderer.resize(window.innerWidth, window.innerHeight);
    }

    get viewport(): Viewport {
        return this.wrappedViewport;
    }

    get screenCoords(): Point {
        return this.wrappedScreenCoords;
    }
}
