import RoomObjectLogic from "../../../../../core/room/object/RoomObjectLogic"
import RoomPlane from "../RoomPlane"
import RoomObjectController from "../../../../../core/room/object/RoomObjectController"

export default class LogicPlane extends RoomObjectLogic {

    private plane: RoomPlane

    constructor(plane: RoomPlane) {
        super()

        this.plane = plane
    }

    onMove?(delta: number): void {
        throw new Error("Method not implemented.")
    }

    onHover?(): void {
        throw new Error("Method not implemented.")
    }


    registerEvents(): void {
        this.plane.getMapObjects().forEach((obj) => {
            if (obj instanceof RoomObjectController) {
                obj.logic?.registerEvents()
            }
        });
    }
    
    tick(delta: number) : void {
        this.plane.getMapObjects().forEach((obj) => {
            if (obj instanceof RoomObjectController) {
                obj.logic?.tick(delta)
            }
        })
    }

    public onClick(): void {}

}