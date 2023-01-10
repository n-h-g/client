import { Container } from 'pixi.js'
import { IDisposable } from './IDisposable'

export interface IRoomVisualization extends IDisposable {
    render(): void
    needsUpdate: boolean
    get container(): Container
}