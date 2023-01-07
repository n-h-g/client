import { Direction } from "readline";

export interface Rotatable {
    rotation: Direction

    rotate(direction: Direction): void
}