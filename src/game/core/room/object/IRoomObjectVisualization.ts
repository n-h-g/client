import IRoomVisualization from "../IRoomVisualization"

export default interface IRoomObjectVisualization extends IRoomVisualization {
    getOffsetX(): number
    getOffsetY(): number
    getZIndex(): number
}