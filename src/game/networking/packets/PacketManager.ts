import { Engine } from '../../Engine'
import { Logger } from '../../utils/Logger'
import { MessageHandler } from '../handler/MessageHandler'
import { LoginResponse } from './incoming/handshake/LoginResponse'
import { PongResponse } from './incoming/handshake/PongResponse'
import AllRoomsList from './incoming/navigator/AllRoomsList'
import MyRoomsList from './incoming/navigator/MyRoomsList'
import { UpdateRoomData } from './incoming/rooms/UpdateRoomData'
import { UpdateUserInformation } from './incoming/users/UpdateUserInformation'
import { OutgoingPacket } from './outgoing/OutgoingPacket'

export class PacketManager {
    private _incomingPackets: Map<number, MessageHandler>

    constructor() {
        this._incomingPackets = new Map<number, MessageHandler>()
        this.bindIncomingPackets();
    }

    private bindIncomingPackets(): void {
        let incomingPacketsHeader: any = {
            1: new LoginResponse,
            2: new PongResponse,
            8: new AllRoomsList,
            9: new MyRoomsList,
            10: new UpdateRoomData,
            17: new UpdateUserInformation
        }

        Object.keys(incomingPacketsHeader).forEach((index) => {
            let packet = incomingPacketsHeader[index];
            this._incomingPackets.set(parseInt(index), packet);
        });
    }

    public applyIn(packetHeader: number, packetBody: any): any {
        let messageHandler: MessageHandler | undefined = this._incomingPackets.get(packetHeader);

        if (messageHandler instanceof MessageHandler) {
            if (Engine.getInstance().config.debug) {
                Logger.debug('%c[INCOMING] %c[' + packetHeader + '] %c(' + messageHandler.constructor.name + ') ', 'color: purple', 'color: DeepPink', 'color: #777', packetBody);
            }
            messageHandler.setMessage(packetBody);
            messageHandler.handle();
        } else if (Engine.getInstance().config.debug) {
            Logger.warning('Unknown packet ' + packetHeader, packetBody);
        }
    }

    public applyOut(packetHeader: OutgoingPacket, packetBody: any = {}): void {
        if (Engine.getInstance().networkingManager?.webSocketManager?.closed) return;

        if (Engine.getInstance().config.debug) {
            Logger.debug('%c[OUTGOING] %c[' + packetHeader + '] %c(' + OutgoingPacket[packetHeader] + ')', 'color: green', 'color: #1493ff', 'color: #777', packetBody);
        }

        Engine.getInstance().networkingManager?.webSocketManager.sendData({
            header: packetHeader,
            body: packetBody,
        });
    }
}