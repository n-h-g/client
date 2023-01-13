import { RoomObjectController } from '../../../../../core/room/object/RoomObjectController'
import { RoomObjectLogic } from '../../../../../core/room/object/RoomObjectLogic'
import { RoomPlane } from '../RoomPlane'

export default class LogicPlane extends RoomObjectLogic {
    private plane: RoomPlane

    constructor(plane: RoomPlane) {
        super()

        this.plane = plane
    }

    onMove?(delta: number): void {
        
    }

    onHover?(): void {

    }

    registerEvents(): void {
        this.plane.mapObjects.forEach((obj) => {
            if (obj instanceof RoomObjectController) {
                obj.logic?.registerEvents()
            }
        });
    }

    tick(delta: number): void {
        this.plane.mapObjects.forEach((obj) => {
            if (obj instanceof RoomObjectController) {
                obj.logic?.tick(delta)
            }
        })
    }

    public onClick(): void {

    }
}