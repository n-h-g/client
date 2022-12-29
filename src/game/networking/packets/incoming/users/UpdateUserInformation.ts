import { MessageHandler } from '../../../handler/MessageHandler';

export class UpdateUserInformation extends MessageHandler {
    public handle(): void {
        let userInfo = this.message

        console.log(userInfo)
    }
}