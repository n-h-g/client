import { Engine } from '../Engine'
import { EventManager } from '../core/events/EventManager'
import { LoadingProgressEventData } from '../engine/events/ui/data/loader/LoadingProgress'
import { Logger } from '../utils/Logger'
import { NetworkingManager } from './NetworkingManager'
import { OutgoingPacket } from './packets/outgoing/OutgoingPacket'
import { UIEvents } from '../engine/events/ui/UIEvents'

export class WebSocketManager {
    private webSocket: WebSocket
    private _closed: boolean = false
    private reconnectCounter: number = 0

    private _networkingManager: NetworkingManager

    constructor(networkingManager: NetworkingManager) {
        this._networkingManager = networkingManager;

        if (Engine.getInstance()?.config.debug)
            Logger.debug('Connection url: ' + this.webSocketUrl);

        this.webSocket = new WebSocket(this.webSocketUrl)
        this.setUpWebSocketEvents()
    }

    private get webSocketUrl(): string {
        let webSocketUrl = Engine.getInstance().config.server.ssl ? 'wss://' : 'ws://'
        webSocketUrl += Engine.getInstance().config.server.host
        webSocketUrl += ':' + Engine.getInstance().config.server.port
        webSocketUrl += '/' + Engine.getInstance().config.server.channel

        return webSocketUrl
    }

    private setUpWebSocketEvents(): void {
        this.webSocket.onopen = () => {
            if (Engine.getInstance().config.debug)
                Logger.debug('Connected')

            Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.PingRequest)
            this._closed = false
        }

        this.webSocket.onerror = (event) => {
            this._closed = true

            if (Engine.getInstance().config.debug) {
                Logger.debug('Connection error - event details: ')
                Logger.info(event.toString())
            }

            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 50,
                message: 'Connection Error'
            })
        }

        this.webSocket.onclose = () => {
            this._closed = true
            this.reconnectCounter = 0

            if (Engine.getInstance().config.server.reconnectOnFail)
                setInterval(() => {
                    while(this._closed && this.reconnectCounter <= Engine.getInstance().config.server.reconnectOnFailTryTimes) { 
                        this.reconnectCounter++;
                        this.setUpWebSocketEvents();
                    }
                }, 2001)
        }

        window.onbeforeunload = () => this.disconnect()

        this.webSocket.onmessage = (event) => {
            let packet = JSON.parse(event.data)
            let header = parseInt(packet.header)
            Engine.getInstance().networkingManager?.packetManager?.applyIn(header, packet.body)
        }
    }

    public disconnect() {
        Logger.info("Disconnected");
        this._networkingManager.packetManager.applyOut(OutgoingPacket.DisconnectMessage)
        this.webSocket.close()
    }

    public get closed(): boolean {
        return this._closed
    }

    public sendData(message: any): void {
        if (!this._closed)
            this.webSocket.send(JSON.stringify(message))
    }
}