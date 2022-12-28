import { IEvent } from '../../../core/ui/events/IEvent'

export type LoadProgressType = {
    width: number,
    message: string
}

export class LoadProgressEvent implements IEvent<LoadProgressType> {
    key: string = 'load-progress'
    data: LoadProgressType
}