import {OutgoingPacket} from './packets/outgoing/OutgoingPacket';
import {PacketManager} from './packets/PacketManager';
import {WebSocketManager} from './WebSocketManager';

export class NetworkingManager {
    readonly webSocketManager: WebSocketManager;
    readonly packetManager: PacketManager;

    constructor() {
        this.webSocketManager = new WebSocketManager(this);
        this.packetManager = new PacketManager();

        this.setUpPingRequest();
    }

    setUpPingRequest(): void {
        window.setInterval(() => {
            this.packetManager.applyOut(OutgoingPacket.PingRequest);
        }, 50000);

        window.onbeforeunload = () => {
            this.packetManager.applyOut(OutgoingPacket.DisconnectMessage);
        };
    }
}
