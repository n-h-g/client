import { NavigatorRoom } from "../../../../core/communication/incoming/navigator/NavigatorRoom"

export type NavigatorRoomsAdded = {
    rooms: NavigatorRoom[]
    tab: string
}