import RoomObjectLogic from "../../../../../core/room/object/RoomObjectLogic";
import Pointer from "../Pointer";
import Point from "../../../../../utils/point/Point";
import ColorRGB from "../../../../../utils/color/ColorRGB";

export default class LogicPointer extends RoomObjectLogic {
    private pointer: Pointer
    private currentColor: ColorRGB = new ColorRGB(0,0,0)

    constructor(pointer: Pointer) {
        super()
        this.pointer = pointer

    }

    public registerEvents() {
        
    }

    public onMove() {
        throw new Error("Method not implemented.");
    }

    public hidePointer() {
        this.currentColor = new ColorRGB(0,0,0)
        this.pointer.getCanvas().visible = false;
    }

    public onHover(): void {
        
    }

    public getCurrentColor() {
        return this.currentColor
    }

    public onClick(): void {
        throw new Error("Method not implemented.");
    }

    tick(delta: number): void {}
    
}