import { ILayer } from './ILayer'
import { IColor } from './IColor'
import { IAnimation } from './IAnimation'

export interface IVisualization {
    layerCount: number
    angle: number
    type: string
    layers?: { [key: string] : ILayer }
    colors?: { [key: string] : IColor }
    directions?: { [key: string] : IDirection }
    animations?: { [key: string] : IAnimation }
}

export interface IDirection {

}