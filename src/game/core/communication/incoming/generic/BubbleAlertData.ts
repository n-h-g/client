import { BubbleActionTypes } from "../../../../engine/game/messenger/bubble/actions/types/BubbleActionTypes"

export interface BubbleAlertData {
    message?: string,
    action?: BubbleActionTypes
    goalId?: number
}