import {Engine} from '../Engine';
import {EventManager} from '../core/events/EventManager';
import {LoadingProgressEventData} from '../engine/events/ui/data/loader/LoadingProgress';
import {Logger} from '../utils/Logger';
import {NetworkingManager} from './NetworkingManager';
import {OutgoingPacket} from './packets/outgoing/OutgoingPacket';
import {UIEvents} from '../engine/events/ui/UIEvents';

export class WebSocketManager {
    /** Waits between the attempts to connect during the loading (the server may be starting): longer and longer. */
    private static readonly RETRY_DELAYS_MS = [2000, 3000, 5000, 10000];

    private webSocket: WebSocket;
    private networkingManager: NetworkingManager;
	private wrappedClosed = true;

    /** True once the user is logged in: before, a connection that fails or closes is tried again. */
    private loggedIn = false;
    /** The connection was closed by the client (logout, wrong ticket, page closed): not tried again. */
    private closedByClient = false;
    private attempts = 0;
    private retryTimer: number | null = null;

    constructor(networkingManager: NetworkingManager) {
        this.networkingManager = networkingManager;

        window.onbeforeunload = () => this.disconnect();

        this.connect();
    }

    /**
     * The game server of the configuration, or (empty host, as in production) the server of the page:
     * the web server forwards the websocket channel to the game.
     */
    private get webSocketUrl(): string {
        const server = Engine.getInstance().config.server;

        if (!server.host) {
            const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
            return protocol + window.location.host + '/' + server.channel;
        }

        return (server.ssl ? 'wss://' : 'ws://') + server.host + ':' + server.port + '/' + server.channel;
    }

    private connect(): void {
        this.retryTimer = null;
        this.attempts++;

        if (Engine.getInstance()?.config.debug)
            Logger.debug('Connecting to server: ' + this.webSocketUrl + ' (attempt ' + this.attempts + ')');

        this.webSocket = new WebSocket(this.webSocketUrl);
        this.setUpWebSocketEvents(this.webSocket);
    }

    /** The user is logged in: the loading is over, a connection lost from now on is not tried again. */
    onLoggedIn(): void {
        this.loggedIn = true;
        this.attempts = 0;
    }

    private setUpWebSocketEvents(webSocket: WebSocket): void {
        webSocket.onopen = () => {
            if (Engine.getInstance().config.debug)
                Logger.debug('Connected');

            this.wrappedClosed = false;

            Engine.getInstance().networkingManager.packetManager.applyOut(
                OutgoingPacket.PingRequest
            );
        };

        // always followed by onclose, that tries again
        webSocket.onerror = () => {
            if (Engine.getInstance().config.debug) {
                Logger.debug('Connection error');
            }
        };

        webSocket.onclose = () => {
            // an old socket (replaced by a new attempt) doesn't count
            if (webSocket !== this.webSocket) return;

            this.wrappedClosed = true;

            if (this.loggedIn || this.closedByClient) return;

            this.retryLater();
        };

        webSocket.onmessage = event => {
            const packet = JSON.parse(event.data);
            const header = parseInt(packet.header);
            Engine.getInstance().networkingManager?.packetManager?.applyIn(
                header,
                packet.body
            );
        };
    }

    /**
     * The server can't be reached during the loading (e.g. it's restarting): the client tries again by itself,
     * waiting more and more between the attempts, and the loader says when.
     */
    private retryLater(): void {
        if (this.retryTimer !== null) return;

        const delays = WebSocketManager.RETRY_DELAYS_MS;
        const delay = delays[Math.min(this.attempts - 1, delays.length - 1)];

        EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
            width: 50,
            message: `Server unreachable, retrying in ${Math.round(delay / 1000)} s...`,
        });

        this.retryTimer = window.setTimeout(() => this.connect(), delay);
    }

    disconnect() {
        this.closedByClient = true;

        if (this.retryTimer !== null) {
            window.clearTimeout(this.retryTimer);
            this.retryTimer = null;
        }

        this.networkingManager.packetManager.applyOut(
            OutgoingPacket.DisconnectMessage
        );
        this.webSocket.close();
    }

    get closed(): boolean {
        return this.wrappedClosed;
    }

    sendData(message: any): void {
        if (!this.wrappedClosed)
            this.webSocket.send(JSON.stringify(message));
    }
}
