import { UserTypingData } from "../../../../../core/communication/incoming/rooms/users/UserTypingData";
import { Engine } from "../../../../../Engine";
import { UserEvents } from "../../../../../engine/events/room/objects/entities/UserEvents";
import UserEntityLogic from "../../../../../engine/room/objects/users/logic/UserEntityLogic";
import { MessageHandler } from "../../../../handler/MessageHandler";

export class UserTypingStatus extends MessageHandler {
    public handle(): void {
        let message = this.message as UserTypingData

        let entity = Engine.getInstance().roomService.CurrentRoom.roomEntityRepository.get(message.id)
        
        if(!entity) return

        let logic = entity.logic as UserEntityLogic

        logic.events.emit(UserEvents.USER_TOGGLE_TYPING, message.typing)
    }
}