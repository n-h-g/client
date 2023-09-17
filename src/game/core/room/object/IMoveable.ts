import Point3d from '../../../utils/point/Point3d';

export interface MoveableVisualization {
    nextPosition: Point3d;
    setNextPosition(nextPosition: Point3d): void;
    move(delta: number): void;
}

export interface MoveableLogic {
    stopRolling(): void;
    roll: boolean;
}

export function isMoveable(arg: any): arg is MoveableVisualization {
    return arg.roll != undefined;
}
