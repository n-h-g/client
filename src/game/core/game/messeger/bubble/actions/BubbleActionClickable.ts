import { IBubbleAction } from "../../../../../engine/game/messenger/bubble/actions/IBubbleAction"

export default interface BubbleActionClickable extends IBubbleAction {
    onConfirm(): void
    onDecline(): void
}