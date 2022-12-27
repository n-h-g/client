export abstract class MessageHandler {
    protected message: any;
    
    public abstract handle(): any

    public setMessage(message: any): void {
        this.message = message
    }
}