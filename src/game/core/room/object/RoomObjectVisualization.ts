import { Container } from 'pixi.js'

export default abstract class RoomObjectVisualization {
    protected _offsetX: number
    protected _offsetY: number
    protected _zIndex: number
    private _container: Container
    private _needsUpdate: boolean

    constructor(offsetX: number, offsetY: number, zIndex: number) {
        this._offsetX = offsetX
        this._offsetY = offsetY
        this._zIndex = zIndex
        this._container = null
        this._needsUpdate = false
    }

    public set needsUpdate(update: boolean) {
        this._needsUpdate = update
    }

    public get needsUpdate(): boolean {
        return this._needsUpdate
    }

    public get offsetX(): number {
        return this._offsetX
    }

    public get offsetY(): number {
        return this._offsetY
    }

    public get zIndex(): number {
        return this._zIndex
    }

    public get container(): Container {
        return this._container
    }

    public set container(container: Container) {
        this._container = container
    }

    abstract render(): void
}