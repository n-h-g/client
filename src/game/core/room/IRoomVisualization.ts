import { Container } from '@pixi/display'

export default interface IRoomVisualization {
    render(): void
    needsUpdate: boolean
    container: Container
}