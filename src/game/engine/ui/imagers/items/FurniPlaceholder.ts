import { Furni } from "./Furni";
import FurniBase from "./FurniBase";

export class FurniPlaceholder extends Furni {
    constructor(furniBase: FurniBase, direction: number = 0, animation: number = 0, frame: number = 0, isIcon: boolean = false, isPlaceholder: boolean = false) {
        super(furniBase, direction, animation, frame, isIcon, true)
    }
}