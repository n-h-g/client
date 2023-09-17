import {Direction} from 'readline';

export interface IRotatable {
    rotation: Direction;
    rotate(direction: Direction): void;
}
