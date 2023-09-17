import {Direction} from '../core/objects/Direction';
import Point from './point/Point';

export default class Rotation {
    public static parseRotation(rot: string): Direction {
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

    public static calculateDirection(point1: Point, point2: Point): Direction {
        if (point1.getX() > point2.getX()) {
            if (point1.getY() > point2.getY()) {
                return Direction.NORTH_EAST;
            }
            if (point1.getY() < point2.getY()) {
                return Direction.SOUTH_EAST;
            }
            return Direction.EAST;
        }

        if (point1.getX() < point2.getX()) {
            if (point1.getY() > point2.getY()) {
                return Direction.NORTH_WEST;
            }
            if (point1.getY() < point2.getY()) {
                return Direction.SOUTH_WEST;
            }
            return Direction.WEST;
        }

        if (point1.getY() > point2.getY()) {
            return Direction.NORTH;
        }

        return Direction.SOUTH;
    }
}
