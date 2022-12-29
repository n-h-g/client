import { PacketManager } from './packets/PacketManager'
import { WebSocketManager } from './WebSocketManager'

export class NetworkingManager {
    private _webSocketManager: WebSocketManager
    private _packetManager: PacketManager

    constructor() {
        this._webSocketManager = new WebSocketManager()
        this._packetManager = new PacketManager()
    }

    public get webSocketManager(): WebSocketManager {
        return this._webSocketManager
    }

    public get packetManager(): PacketManager {
        return this._packetManager
    }
}