import { Engine } from '../../Engine'
import { Logger } from '../../utils/Logger'
import { MessageHandler } from '../handler/MessageHandler'
import { CataloguePage } from './incoming/catalogue/CataloguePage'
import { CataloguePages } from './incoming/catalogue/CataloguePages'
import { LoginResponse } from './incoming/handshake/LoginResponse'
import { PongResponse } from './incoming/handshake/PongResponse'
import LoadInventoryItems from './incoming/items/LoadInventoryItem'
import AllRoomsList from './incoming/navigator/AllRoomsList'
import MyRoomsList from './incoming/navigator/MyRoomsList'
import AddRoomEntity from './incoming/rooms/entities/AddRoomEntity'
import LoadRoomEntities from './incoming/rooms/entities/LoadRoomEntities'
import RemoveEntity from './incoming/rooms/entities/RemoveEntity'
import UpdateEntity from './incoming/rooms/entities/UpdateEntity'
import { UpdateRoomData } from './incoming/rooms/UpdateRoomData'
import { UserTypingStatus } from './incoming/rooms/users/UserTypingStatus'
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
            101: new AllRoomsList,
            102: new MyRoomsList,
            200: new UpdateRoomData,
            202: new LoadRoomEntities,
            203: new UpdateEntity,
            204: new AddRoomEntity,
            205: new RemoveEntity,
            207: new UserTypingStatus,
            400: new UpdateUserInformation,
            800: new CataloguePages,
            801: new CataloguePage,
            18: new LoadInventoryItems,
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