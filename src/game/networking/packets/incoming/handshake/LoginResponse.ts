import {Engine} from '../../../../Engine';
import {EventManager} from '../../../../core/events/EventManager';
import {LoadingProgressEventData} from '../../../../engine/events/ui/data/loader/LoadingProgress';
import {MessageHandler} from '../../../handler/MessageHandler';
import {OutgoingPacket} from '../../outgoing/OutgoingPacket';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {UIComponent} from '../../../../engine/ui/components/UIComponent';
import {GameLoaderUI} from '../../../../engine/ui/components/loader/GameLoaderUI';
import {clearLegacySso, clearToken} from '../../../../auth/session';

export class LoginResponse extends MessageHandler {
    handle(): void {
        if (Engine.getInstance().config.offlineMode) return;

        if (this.message.data) {
            // the loading is over: a connection lost from now on is not tried again
            Engine.getInstance()?.networkingManager?.webSocketManager?.onLoggedIn();

            const GameLoaderUI: GameLoaderUI =
                Engine.getInstance().userInterfaceManager.componentsManager.getComponent<GameLoaderUI>(
                    UIComponent.GameLoaderUI
                );
            if (
                GameLoaderUI.progress == 50 &&
                Engine.getInstance().userInterfaceManager.ready
            )
                EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                    width: 100,
                    message: 'Logged',
                });

            Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
                OutgoingPacket.UserProfileInformation
            );
        } else {
            // refused (an expired token, an unknown user, the legacy SSO disabled): back to the login page
            const engine = Engine.getInstance();
            engine?.networkingManager?.webSocketManager?.disconnect();
            if (engine?.token) clearToken();
            else clearLegacySso();
            window.location.assign('/login?expired=1');
        }
    }
}
