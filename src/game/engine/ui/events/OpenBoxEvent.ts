import { IEvent } from '../../../core/ui/events/IEvent'

export type OpenBoxType = {
    type: string
}

export class OpenBoxEvent implements IEvent<OpenBoxType> {
    key: string = 'open-box'
    data: OpenBoxType
}