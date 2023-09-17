import {UiUtils} from '../../utils/UiUtils';
import {Message} from './Message';

export abstract class BubbleMessage extends Message {
    uuid: string;

    constructor(
        id: number,
        senderId: number,
        destinationId: number,
        friendshipId: number,
        text: string
    ) {
		super(id, senderId, destinationId, friendshipId, text)

        this.uuid = 'ID-' + UiUtils.guidGenerator();
    }

    abstract compose(): void;
}
