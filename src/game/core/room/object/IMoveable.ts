import Point3d from "../../../utils/point/Point3d";

export interface Moveable {
    nextPosition: Point3d

    setNextPosition(nextPosition: Point3d): void

    move(delta: number): void
}