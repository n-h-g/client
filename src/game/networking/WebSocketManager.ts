import {Engine} from '../Engine';
import {EventManager} from '../core/events/EventManager';
import {LoadingProgressEventData} from '../engine/events/ui/data/loader/LoadingProgress';
import {Logger} from '../utils/Logger';
import {NetworkingManager} from './NetworkingManager';
import {OutgoingPacket} from './packets/outgoing/OutgoingPacket';
import {UIEvents} from '../engine/events/ui/UIEvents';

export class WebSocketManager {
    private webSocket: WebSocket;
    private reconnectCounter = 0;
    private networkingManager: NetworkingManager;
	private wrappedClosed = false;

    constructor(networkingManager: NetworkingManager) {
        this.networkingManager = networkingManager;

        if (Engine.getInstance()?.config.debug) {
            Logger.debug('Connection url: ' + this.webSocketUrl);
        }

        this.webSocket = new WebSocket(this.webSocketUrl);
        this.setUpWebSocketEvents();
    }

    private get webSocketUrl(): string {
        let webSocketUrl = Engine.getInstance().config.server.ssl
            ? 'wss://'
            : 'ws://';
        webSocketUrl += Engine.getInstance().config.server.host;
        webSocketUrl += ':' + Engine.getInstance().config.server.port;
        webSocketUrl += '/' + Engine.getInstance().config.server.channel;

        return webSocketUrl;
    }

    private setUpWebSocketEvents(): void {
        this.webSocket.onopen = event => {
            if (Engine.getInstance().config.debug) {
                Logger.debug('Connected');
            }

            Engine.getInstance().networkingManager.packetManager.applyOut(
                OutgoingPacket.PingRequest
            );

            this.wrappedClosed = false;
        };

        this.webSocket.onerror = event => {
            this.wrappedClosed = true;

            if (Engine.getInstance().config.debug) {
                Logger.debug('Connection error - event details: ');
                Logger.info(event.toString());
            }

            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 50,
                message: 'Connection Error',
            });
        };

        this.webSocket.onclose = event => {
            this.wrappedClosed = true;
            this.reconnectCounter = 0;

            if (Engine.getInstance().config.server.reconnectOnFail) {
                setInterval(() => {
                    while (
                        this.wrappedClosed &&
                        this.reconnectCounter <=
                            Engine.getInstance().config.server
                                .reconnectOnFailTryTimes
                    ) {
                        this.reconnectCounter++;
                        this.setUpWebSocketEvents();
                    }
                }, 2001);
                setTimeout(() => {}, 4000);
            }
        };

        window.onbeforeunload = () => this.disconnect();

        this.webSocket.onmessage = event => {
            const packet = JSON.parse(event.data);
            const header = parseInt(packet.header);
            Engine.getInstance().networkingManager?.packetManager?.applyIn(
                header,
                packet.body
            );
        };
    }

    disconnect() {
        Logger.info('Disconnected');
        this.networkingManager.packetManager.applyOut(
            OutgoingPacket.DisconnectMessage
        );
        this.webSocket.close();
    }

    get closed(): boolean {
        return this.wrappedClosed;
    }

    sendData(message: any): void {
        if (!this.wrappedClosed) {
            this.webSocket.send(JSON.stringify(message));
        }
    }
}
