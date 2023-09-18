import {RoomObjectLogic} from '../../../../../core/room/object/RoomObjectLogic';
import {ColorRGB} from '../../../../../utils/color/ColorRGB';
import {Pointer} from '../Pointer';

export class PointerLogic extends RoomObjectLogic {
    private pointer: Pointer;
    private visible = false;
    private currentColor: ColorRGB = new ColorRGB(0, 0, 0);

    constructor(pointer: Pointer) {
        super();
        this.pointer = pointer;
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    registerEvents() {}

    onMove() {
        throw new Error('Method not implemented.');
    }

    hidePointer() {
        this.currentColor = new ColorRGB(0, 0, 0);
        this.visible = false;
        this.pointer.getCanvas().visible = false;
    }

    togglePointer() {}

    onHover(): void {}

    getCurrentColor() {
        return this.currentColor;
    }

    onClick(): void {}

    tick(delta: number): void {}
}
