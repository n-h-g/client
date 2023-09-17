import {IRoomLogic} from './IRoomLogic';
import {IRoomVisualization} from './IRoomVisualization';

export interface IRoomController {
    _visualization: IRoomVisualization;
    _logic: IRoomLogic;
}
