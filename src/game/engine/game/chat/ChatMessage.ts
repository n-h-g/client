import UiUtils from "../../../utils/UiUtils";
import { MessageType } from "../../../core/game/chat/MessageType";
import { Message } from "../../../core/game/chat/Message";
import AvatarData from "../../ui/imagers/avatars/enum/AvatarData";
import UserEntityVisualization from "../../room/objects/users/visualization/UserEntityVisualization";
import { Entity } from "../../../core/room/object/entities/Entity";


export default class RoomChatMessage extends Message {
    private messageType: MessageType;

    private whisper: boolean = false;
    private x: number = 0;
    private y: number = 0;
    private width: number = 0;

    private author: Entity;

    constructor(id: number, message: string, author: Entity, messageType: MessageType, destinationId: number = -1) {
        super(id, parseInt(author.id), messageType, messageType == MessageType.WHISPER ? destinationId : -1, message);
        this.text = message;
        this.messageType = messageType;
        this.author = author;

    }

    public compose() {
        this.x = this.senderId ? UiUtils.getGlobalPosition((this.author?.visualization.container)).tx + AvatarData.AVATAR_LEFT_OFFSET : -AvatarData.AVATAR_GENERIC_WIDTH;
        this.y = this.senderId ? UiUtils.getGlobalPosition((this.author.visualization.container)).ty - (this.author.visualization.container.height * 2): 0;
    }

    public get Message(): string {
        return this.text;
    }
    public get MessageType(): MessageType {
        return this.messageType;
    }
    public get X(): number {
        return this.x;
    }
    public get Y(): number {
        return this.y;
    }
    public get Author(): Entity {
        return this.author;
    }
}

