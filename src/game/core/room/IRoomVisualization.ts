import { Container } from 'pixi.js'

export default interface IRoomVisualization {
    render(): void
    needsUpdate: boolean
    container: Container
}