import { Engine } from '../Engine'
import { EventManager } from '../engine/ui/events/EventManager'
import { LoadProgressEvent } from '../engine/ui/events/LoadProgressEvent'
import { UIEvents } from '../engine/ui/events/UIEvents'
import { Logger } from '../utils/Logger'
import { OutgoingPacket } from './packets/outgoing/OutgoingPacket'

export class WebSocketManager {
    private webSocket: WebSocket
    private _closed: boolean = false
    private reconnectCounter: number = 0

    constructor() {
        if (Engine.getInstance().config.debug) {
            Logger.debug('Connection url: ' + this.webSocketUrl);
        }

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
        this.webSocket.onopen = (event) => {
            if (Engine.getInstance().config.debug) {
                Logger.debug('Connected')
            }

            this._closed = false

            Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.LoginMessage,
                {
                    sso: 1
                }
            )

            EventManager.emit(UIEvents.LOAD, new LoadProgressEvent({
                width: 20,
                message: 'Connected'
            }))
        }

        this.webSocket.onerror = (event) => {
            this._closed = true

            if (Engine.getInstance().config.debug) {
                Logger.debug('Connection error - event details: ')
                Logger.info(event.toString())
            }

            EventManager.emit(UIEvents.LOAD, new LoadProgressEvent({
                width: 20,
                message: 'Connection Error'
            }))
        }

        this.webSocket.onclose = (event) => {
            this._closed = true
            this.reconnectCounter = 0

            if (Engine.getInstance().config.server.reconnectOnFail) {
                setInterval(() => {
                    while(this._closed && this.reconnectCounter <= Engine.getInstance().config.server.reconnectOnFailTryTimes) { 
                        this.reconnectCounter++;
                        this.setUpWebSocketEvents();
                    }
                }, 2001)
                setTimeout(() => {

                }, 4000)
            }
        }

        //window.onbeforeunload = () => this.disconnect()

        this.webSocket.onmessage = (event) => {
            let packet = JSON.parse(event.data)
            let header = parseInt(packet.header)
            Engine.getInstance().networkingManager?.packetManager?.applyIn(header, packet.body)
        }
    }

    public get closed(): boolean {
        return this._closed
    }

    public sendData(message: any): void {
        if (!this._closed) {
            this.webSocket.send(JSON.stringify(message));
        }
    }
}