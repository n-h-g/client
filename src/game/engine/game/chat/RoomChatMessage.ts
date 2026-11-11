import {UiUtils} from '../../../utils/UiUtils';
import {MessageType} from '../../../core/chat/MessageType';
import {Message} from '../../../core/chat/Message';
import {AvatarData} from '../../ui/imagers/avatars/enum/AvatarData';
import {Entity} from '../../../core/room/object/entities/Entity';
import {Engine} from '../../../Engine';

export class RoomChatMessage extends Message {
	y = 0;
    x = 0;
    readonly author: Entity;
    readonly messageType: MessageType;
    /** The username a whisper is for. */
    readonly recipient?: string;
    /** The style of the bubble. */
    readonly style: number;
    /** A notice of the game on an entity (e.g. a pet was scratched): the bubble has only the text. */
    readonly info: boolean;

    constructor(
        message: string,
        author: Entity,
        messageType: MessageType,
        destinationId = -1,
        recipient?: string,
        style = 0,
        info = false
    ) {
        super(
            Engine.getInstance().chatService.getLastMessageId(),
            parseInt(author.id),
            messageType,
            messageType == MessageType.WHISPER ? destinationId : -1,
            message
        );
        this.messageType = messageType;
        this.author = author;
        this.recipient = recipient;
        this.style = style;
        this.info = info;

        this.compose();
    }

    compose() {
        this.x = this.author.id
            ? UiUtils.getGlobalPosition(this.author?.visualization.container)
                  .tx + AvatarData.AVATAR_LEFT_OFFSET
            : -AvatarData.AVATAR_GENERIC_WIDTH;
        this.y = this.author.id
            ? UiUtils.getGlobalPosition(this.author.visualization.container)
                  .ty -
              this.author.visualization.container.height * 2
            : 0;
    }
}
