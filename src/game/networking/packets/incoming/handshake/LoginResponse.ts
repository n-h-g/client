import { MessageHandler } from '../../../handler/MessageHandler';

export class LoginResponse extends MessageHandler {
    public handle() {
        if (this.message.data) {
            console.log(this.message)
        }
    }
}