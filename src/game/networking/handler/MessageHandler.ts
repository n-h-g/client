export abstract class MessageHandler {
    protected message: any

    public abstract handle(): void

    public setMessage(message: any): void {
        this.message = message
    }
}