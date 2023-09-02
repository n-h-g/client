import UiUtils from "../../../utils/UiUtils";
import { MessageType } from "../../../core/game/chat/MessageType";
import { Message } from "../../../core/game/chat/Message";
import AvatarData from "../../ui/imagers/avatars/enum/AvatarData";
import { UserEntity } from '../../room/objects/users/UserEntity';

export default class RoomChatMessage extends Message {
    private _messageType: MessageType
    private _x: number = 0
    private _y: number = 0
    private _author: UserEntity

    constructor(id: number, message: string, author: UserEntity, messageType: MessageType, destinationId: number = -1) {
        super(id, parseInt(author.id), messageType, messageType == MessageType.WHISPER ? destinationId : -1, message)
        this.text = message
        this._messageType = messageType
        this._author = author
    }

    public compose() {
        this._x = this.senderId ? UiUtils.getGlobalPosition((this._author?.visualization.container)).tx + AvatarData.AVATAR_LEFT_OFFSET : -AvatarData.AVATAR_GENERIC_WIDTH
        this._y = this.senderId ? UiUtils.getGlobalPosition((this._author.visualization.container)).ty - (this._author.visualization.container.height * 2) : 0
    }

    public get Message(): string {
        return this.text
    }

    public get MessageType(): MessageType {
        return this._messageType
    }

    public get X(): number {
        return this._x
    }

    public get Y(): number {
        return this._y
    }

    public get Author(): UserEntity {
        return this._author
    }
}