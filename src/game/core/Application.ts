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
    private _engine: Engine;
    private _lastFrameTime: number;
    private _timeElapsed = 0;
    private _viewport: Viewport;
    private debugInfoContainer: Container;
    private viewPortScreenCords: Point;

    constructor(engine: Engine, options?: Partial<IApplicationOptions>) {
        super(options);

        this.stage.eventMode = 'dynamic';

        this.view.style.height = window.innerHeight + 'px';
        this.view.style.width = window.innerWidth + 'px';

        this.debugInfoContainer = new Container();

        this.setUpViewport();

        this._engine = engine;
    }

    public setUpViewport() {
        if (this._viewport != null) this._viewport.destroy();

        this._viewport = new Viewport({
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            worldWidth: 1000,
            worldHeight: 1000,
            events: this.renderer.events,
        });

        this._viewport.eventMode = 'dynamic';

        this.stage.addChild(this._viewport);

        this.stage.addChild(this.debugInfoContainer);

        this.viewPortScreenCords = new Point(
            window.innerWidth,
            window.innerHeight
        );

        this._viewport.drag({
            wheel: false,
        });
    }

    public showDebugInfo(fps: number = this.ticker.FPS) {
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

    public init(): void {
        this.setUpEvents();
        this.setUpGameLoop();
    }

    private setUpGameLoop(): void {
        const fpsInterval = 1000 / Engine.getInstance().config.fps;
        this._lastFrameTime = Date.now();

        const gameLoop = () => {
            window.requestAnimationFrame(gameLoop);

            const currentTime = Date.now();

            this._timeElapsed = currentTime - this._lastFrameTime;

            if (this._lastFrameTime > fpsInterval) {
                this._engine.roomService.tick(this._timeElapsed);
                this._lastFrameTime = currentTime;

                if (this._engine.config.debug) {
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

    public get viewport(): Viewport {
        return this._viewport;
    }

    public get screenCords(): Point {
        return this.viewPortScreenCords;
    }
}
