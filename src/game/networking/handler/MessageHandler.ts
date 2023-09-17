export abstract class MessageHandler {
    message: any;

    abstract handle(): void;
}
