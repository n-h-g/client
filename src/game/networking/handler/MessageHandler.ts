import { IMessageHandler } from "../../core/communication/IMessageHandler"

export abstract class MessageHandler implements IMessageHandler{
    protected message: any

    public abstract handle(): void

    public setMessage(message: any): void {
        this.message = message
    }
}