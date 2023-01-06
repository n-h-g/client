import { NavigatorRoom } from "../../../../../core/communication/incoming/navigator/NavigatorRoom"

export type NavigatorRoomsEventData = {
    rooms: NavigatorRoom[]
    tab: string
}