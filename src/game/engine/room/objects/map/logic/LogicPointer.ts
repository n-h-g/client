import { RoomObjectLogic } from '../../../../../core/room/object/RoomObjectLogic'
import { ColorRGB } from '../../../../../utils/color/ColorRGB'
import Pointer from '../Pointer'

export default class LogicPointer extends RoomObjectLogic {
    private pointer: Pointer
    private visible: boolean = false
    private currentColor: ColorRGB = new ColorRGB(0, 0, 0)

    constructor(pointer: Pointer) {
        super()
        this.pointer = pointer
    }

    dispose(): void {
        throw new Error('Method not implemented.')
    }

    public registerEvents() {

    }

    public onMove() {
        throw new Error("Method not implemented.");
    }

    public hidePointer() {
        this.currentColor = new ColorRGB(0, 0, 0)
        this.visible = false;
        this.pointer.getCanvas().visible = false;
    }

    public togglePointer() {

    }

    public onHover(): void {

    }

    public getCurrentColor() {
        return this.currentColor
    }

    public onClick(): void {
        
    }

    tick(delta: number): void {

    }
}