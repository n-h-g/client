import {Direction} from '../core/objects/Direction';
import {Point} from './point/Point';

export class Rotation {
    static parseRotation(rot: string): Direction {
        switch (rot) {
            case 'NORTH':
                return Direction.NORTH;
            case 'SOUTH':
                return Direction.SOUTH;
            case 'WEST':
                return Direction.WEST;
            case 'NORTH_EAST':
                return Direction.NORTH_EAST;
            case 'SOUTH_WEST':
                return Direction.SOUTH_WEST;
            case 'NORTH_WEST':
                return Direction.NORTH_WEST;
            case 'SOUTH_EAST':
                return Direction.SOUTH_EAST;
            case 'EAST':
                return Direction.EAST;
            default:
                return Direction.SOUTH;
        }
    }

    static calculateDirection(point1: Point, point2: Point): Direction {
        if (point1.x > point2.x) {
            if (point1.y > point2.y) {
                return Direction.NORTH_EAST;
            }
            if (point1.y < point2.y) {
                return Direction.SOUTH_EAST;
            }
            return Direction.EAST;
        }

        if (point1.x < point2.x) {
            if (point1.y > point2.y) {
                return Direction.NORTH_WEST;
            }
            if (point1.y < point2.y) {
                return Direction.SOUTH_WEST;
            }
            return Direction.WEST;
        }

        if (point1.y > point2.y) {
            return Direction.NORTH;
        }

        return Direction.SOUTH;
    }
}
