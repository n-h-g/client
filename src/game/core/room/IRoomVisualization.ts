import { Container } from 'pixi.js'

export interface IRoomVisualization {
    render(): void
    needsUpdate: boolean
    container: Container
}