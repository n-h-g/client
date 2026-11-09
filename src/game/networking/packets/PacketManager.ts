import {Engine} from '../../Engine';
import {Logger} from '../../utils/Logger';
import {MessageHandler} from '../handler/MessageHandler';
import {CataloguePage} from './incoming/catalogue/CataloguePage';
import {CataloguePages} from './incoming/catalogue/CataloguePages';
import {BuyItem} from './incoming/catalogue/BuyItem';
import {CatalogueSearch} from './incoming/catalogue/CatalogueSearch';
import {LoginResponse} from './incoming/handshake/LoginResponse';
import {PongResponse} from './incoming/handshake/PongResponse';
import {BubbleAlert} from './incoming/general/BubbleAlert';
import {LoadInventoryItems} from './incoming/items/LoadInventoryItem';
import {InventoryBadges} from './incoming/inventory/InventoryBadges';
import {InventoryBots} from './incoming/inventory/InventoryBots';
import {InventoryPets} from './incoming/inventory/InventoryPets';
import {AllRoomsList} from './incoming/navigator/AllRoomsList';
import {MyRoomsList} from './incoming/navigator/MyRoomsList';
import {AddRoomEntity} from './incoming/rooms/entities/AddRoomEntity';
import {LoadRoomEntities} from './incoming/rooms/entities/LoadRoomEntities';
import {NewRoomMessage} from './incoming/rooms/entities/NewRoomMessage';
import {RemoveEntity} from './incoming/rooms/entities/RemoveEntity';
import {UpdateEntity} from './incoming/rooms/entities/UpdateEntity';
import {ObjectsRolling} from './incoming/rooms/entities/ObjectsRolling';
import {RoomDimmerPresets} from './incoming/rooms/items/RoomDimmerPresets';
import { ReceiveRoomId } from './incoming/rooms/ReceiveRoomId';
import {RoomPaint} from './incoming/rooms/RoomPaint';
import {UpdateRoomData} from './incoming/rooms/UpdateRoomData';
import {UserTypingStatus} from './incoming/rooms/users/UserTypingStatus';
import {UserGesture} from './incoming/rooms/users/UserGesture';
import {UpdateUserInformation} from './incoming/users/UpdateUserInformation';
import {OutgoingPacket} from './outgoing/OutgoingPacket';
import {FriendsList} from './incoming/friends/FriendsList';
import {FriendRequestReceived} from './incoming/friends/FriendRequestReceived';
import {FriendRequestResult} from './incoming/friends/FriendRequestResult';
import {FriendMessage} from './incoming/friends/FriendMessage';

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
            5: new BubbleAlert(),
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
            209: new RoomPaint(),
            210: new ObjectsRolling(),
            211: new RoomDimmerPresets(),
            212: new UserGesture(),
            400: new UpdateUserInformation(),
            401: new LoadInventoryItems(),
            402: new InventoryBadges(),
            403: new InventoryBots(),
            404: new InventoryPets(),
            800: new CataloguePages(),
            801: new CataloguePage(),
            802: new BuyItem(),
            804: new CatalogueSearch(),
            900: new FriendsList(),
            901: new FriendRequestReceived(),
            902: new FriendRequestResult(),
            903: new FriendMessage(),
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
