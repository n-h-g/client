import Point3d from '../../../utils/point/Point3d'

export interface Positionable {
    position: Point3d
    setPosition(position: Point3d): void
}