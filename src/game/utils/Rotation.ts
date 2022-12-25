import { Direction } from "../core/objects/Direction";
import Point from "./point/Point";

export default class Rotation {
    public static parseRotation(rot: string): Direction {
        switch (rot) {
            case "NORTH":
                return Direction.NORTH;
            case "SOUTH":
                return Direction.SOUTH;
            case "WEST":
                return Direction.WEST;
            case "NORTH_EAST":
                return Direction.NORTH_EAST;
            case "SOUTH_WEST":
                return Direction.SOUTH_WEST;
            case "NORTH_WEST":
                return Direction.NORTH_WEST;  
            case "SOUTH_EAST":
                return Direction.SOUTH_EAST;  
            case "EAST":
                return Direction.EAST;                    
            default:
                return Direction.SOUTH;
        }
    }
    public static isFlipped(direction: Direction | undefined): boolean {
        if(direction === Direction.SOUTH || direction === Direction.SOUTH_WEST || direction == Direction.NORTH_WEST || direction == Direction.SOUTH_EAST || direction == Direction.WEST) {
            return true;
        } 
        return false;
    }

    public static calculateDirection(a: Point, b: Point, defaultDirection: Direction): Direction {
        if (a.getX() === b.getX() && a.getY() === b.getY())
            return defaultDirection;

        if (b.getX() < a.getX() && b.getY() > a.getY())
            return Direction.NORTH_EAST;
        else if (b.getX() === a.getX() && b.getY() > a.getY())
            return Direction.NORTH;
        else if (b.getX() > a.getX() && b.getY() > a.getY())
            return Direction.NORTH_WEST;
        else if (b.getX() > a.getX() && b.getY() === a.getY())
            return Direction.WEST;
        else if (b.getX() > a.getX() && b.getY() < a.getY())
            return Direction.SOUTH_WEST;
        else if (b.getX() === a.getX() && b.getY() < a.getY())
            return Direction.SOUTH;
        else if (b.getX() < a.getX() && b.getY() < a.getY())
            return Direction.SOUTH_EAST;
        else
            return Direction.EAST;


    }
}