import UiUtils from '../../../utils/UiUtils';
import {MessageType} from '../../../core/game/chat/MessageType';
import {Message} from '../../../core/game/chat/Message';
import AvatarData from '../../ui/imagers/avatars/enum/AvatarData';
import {UserEntity} from '../../room/objects/users/UserEntity';
import {Entity} from '../../../core/room/object/entities/Entity';
import {Engine} from '../../../Engine';

export default class RoomChatMessage extends Message {
    private _messageType: MessageType;
    private _x = 0;
    private _y = 0;
    private _author: Entity;

    constructor(
        message: string,
        author: Entity,
        messageType: MessageType,
        destinationId = -1
    ) {
        super(
            Engine.getInstance().chatService.getLastMessageId(),
            parseInt(author.id),
            messageType,
            messageType == MessageType.WHISPER ? destinationId : -1,
            message
        );
        this.text = message;
        this._messageType = messageType;
        this._author = author;

        this.compose();
    }

    public compose() {
        this._x = this._author.id
            ? UiUtils.getGlobalPosition(this._author?.visualization.container)
                  .tx + AvatarData.AVATAR_LEFT_OFFSET
            : -AvatarData.AVATAR_GENERIC_WIDTH;
        this._y = this._author.id
            ? UiUtils.getGlobalPosition(this._author.visualization.container)
                  .ty -
              this._author.visualization.container.height * 2
            : 0;
    }

    public set height(height: number) {
        this.height = height;
    }

    public set width(width: number) {
        this.width = width;
    }

    public get Message(): string {
        return this.text;
    }

    public get height(): number {
        return 0;
    }

    public get width(): number {
        return 0;
    }

    public get MessageType(): MessageType {
        return this._messageType;
    }

    public get x(): number {
        return this._x;
    }

    public get y(): number {
        return this._y;
    }

    public get _id(): number {
        return Engine.getInstance().chatService.getLastMessageId() + 1;
    }

    public get author(): Entity {
        return this._author;
    }
}
