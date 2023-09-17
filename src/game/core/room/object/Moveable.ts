import {Point3d} from '../../../utils/point/Point3d';

export interface MoveableVisualization {
    setNextPosition(nextPosition: Point3d): void;
    move(delta: number): void;
}

export interface MoveableLogic {
    stopRolling(): void;
    roll: boolean;
}
