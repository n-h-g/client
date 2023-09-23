import { Engine } from '../../../../Engine';
import {MessageHandler} from '../../../handler/MessageHandler';
import { OutgoingPacket } from '../../outgoing/OutgoingPacket';

export class ReceiveRoomId extends MessageHandler {
    handle(): void {
        const roomId: number = this.message.data;

		if (roomId == null)
			return;
		
		Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.UserEnterRoom, {
			id: roomId
		})
    }
}
