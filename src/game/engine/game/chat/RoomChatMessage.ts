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
        this.messageType = messageType;
        this.author = author;

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
