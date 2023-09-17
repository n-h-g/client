import {IMessageHandler} from '../../core/communication/IMessageHandler';

export abstract class MessageHandler implements IMessageHandler {
    protected message: any;

    abstract handle(): void;

    setMessage(message: any): void {
        this.message = message;
    }
}
