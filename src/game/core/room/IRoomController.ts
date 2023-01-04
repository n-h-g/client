import { IRoomLogic } from './IRoomLogic'
import { IRoomVisualization } from './IRoomVisualization'

export default interface IRoomController {
    _visualization: IRoomVisualization
    _logic: IRoomLogic
}