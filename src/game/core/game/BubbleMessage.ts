import {UiUtils} from '../../utils/UiUtils';
import {IMessage} from './IMessage';

export abstract class BubbleMessage implements IMessage {
    text: string;
    uuid: string;
    id = -1;

    constructor(message: string) {
        this.text = message;
        this.uuid = 'ID-' + UiUtils.guidGenerator();
    }

    abstract compose(): void;
}
