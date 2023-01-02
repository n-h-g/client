import IRoomObjectVisualization from "./IRoomObjectVisualization"
import { Container } from 'pixi.js'

export default abstract class RoomObjectVisualization implements IRoomObjectVisualization {

    protected offsetX: number
    protected offsetY: number
    protected zIndex: number

    /**
     * The graphic container of room object visualization
     */
    public container: Container | null = null;

    
    public needsUpdate: boolean = false;

    constructor(offsetX: number, offsetY: number, zIndex: number) {
        this.offsetX = offsetX
        this.offsetY = offsetY
        this.zIndex = zIndex
        this.container = null;
        this.needsUpdate = false;
    }

    getOffsetX() : number {
        return this.offsetX
    }

    getOffsetY() : number {
        return this.offsetY
    }
    
    getZIndex() : number {
        return this.zIndex
    }

    abstract render() : void
    
}