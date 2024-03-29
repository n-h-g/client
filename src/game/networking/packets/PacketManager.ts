import {Engine} from '../../Engine';
import {Logger} from '../../utils/Logger';
import {MessageHandler} from '../handler/MessageHandler';
import {CataloguePage} from './incoming/catalogue/CataloguePage';
import {CataloguePages} from './incoming/catalogue/CataloguePages';
import {LoginResponse} from './incoming/handshake/LoginResponse';
import {PongResponse} from './incoming/handshake/PongResponse';
import {LoadInventoryItems} from './incoming/items/LoadInventoryItem';
import {AllRoomsList} from './incoming/navigator/AllRoomsList';
import {MyRoomsList} from './incoming/navigator/MyRoomsList';
import {AddRoomEntity} from './incoming/rooms/entities/AddRoomEntity';
import {LoadRoomEntities} from './incoming/rooms/entities/LoadRoomEntities';
import {NewRoomMessage} from './incoming/rooms/entities/NewRoomMessage';
import {RemoveEntity} from './incoming/rooms/entities/RemoveEntity';
import {UpdateEntity} from './incoming/rooms/entities/UpdateEntity';
import { ReceiveRoomId } from './incoming/rooms/ReceiveRoomId';
import {UpdateRoomData} from './incoming/rooms/UpdateRoomData';
import {UserTypingStatus} from './incoming/rooms/users/UserTypingStatus';
import {UpdateUserInformation} from './incoming/users/UpdateUserInformation';
import {OutgoingPacket} from './outgoing/OutgoingPacket';

export class PacketManager {
    private incomingPackets: Map<number, MessageHandler>;

    constructor() {
        this.incomingPackets = new Map<number, MessageHandler>();
        this.bindIncomingPackets();
    }

    private bindIncomingPackets(): void {
        const incomingPacketsHeader: any = {
            1: new LoginResponse(),
            2: new PongResponse(),
            101: new AllRoomsList(),
            102: new MyRoomsList(),
            200: new UpdateRoomData(),
            202: new LoadRoomEntities(),
            203: new UpdateEntity(),
            204: new AddRoomEntity(),
            205: new RemoveEntity(),
            206: new NewRoomMessage(),
            207: new UserTypingStatus(),
			208: new ReceiveRoomId(),
            400: new UpdateUserInformation(),
            401: new LoadInventoryItems(),
            800: new CataloguePages(),
            801: new CataloguePage()
        };

        Object.keys(incomingPacketsHeader).forEach(index => {
            const packet = incomingPacketsHeader[index];
            this.incomingPackets.set(parseInt(index), packet);
        });
    }

    applyIn(packetHeader: number, packetBody: any): void {
        const messageHandler: MessageHandler = this.incomingPackets.get(packetHeader);

		if (messageHandler == null) {
			if (Engine.getInstance().config.debug)
				Logger.warning('Unknown packet ' + packetHeader, packetBody);
			return;
		}

        if (Engine.getInstance().config.debug)
			Logger.debug(`%c[INCOMING] %c[${packetHeader}] %c(${messageHandler.constructor.name})`,
					     'color: green',
						 'color: red',
						 'color: blue',
						 packetBody);

		messageHandler.message = packetBody;
		messageHandler.handle();
    }

    applyOut(packetHeader: OutgoingPacket, packetBody: any = {}): void {
        if (Engine.getInstance().networkingManager?.webSocketManager?.closed)
            return;

        if (Engine.getInstance().config.debug)
			Logger.debug(`%c[OUTGOING] %c[${packetHeader}] %c(${OutgoingPacket[packetHeader]})`,
					     'color: red',
						 'color: green',
						 'color: blue',
						 packetBody);

        Engine.getInstance().networkingManager?.webSocketManager?.sendData({
            header: packetHeader,
            body: packetBody,
        });
    }
}
