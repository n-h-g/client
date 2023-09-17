import {IRoomVisualization} from '../IRoomVisualization';

export interface IRoomObjectVisualization extends IRoomVisualization {
    get offsetX(): number;
    get offsetY(): number;
    get zIndex(): number;
}
