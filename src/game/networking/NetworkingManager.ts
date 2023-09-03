import { OutgoingPacket } from './packets/outgoing/OutgoingPacket'
import { PacketManager } from './packets/PacketManager'
import { WebSocketManager } from './WebSocketManager'

export class NetworkingManager {
    private _webSocketManager: WebSocketManager
    private _packetManager: PacketManager

    constructor() {
        this._webSocketManager = new WebSocketManager(this)
        this._packetManager = new PacketManager()

        this.setUpPingRequest()
    }

    public setUpPingRequest() : void {
        window.setInterval(() => {
            this.packetManager.applyOut(OutgoingPacket.PingRequest);
        }, 50000);
        window.onbeforeunload = () => {
            this.packetManager.applyOut(OutgoingPacket.DisconnectMessage);
        };
    }

    public get webSocketManager(): WebSocketManager {
        return this._webSocketManager
    }

    public get packetManager(): PacketManager {
        return this._packetManager
    }
}