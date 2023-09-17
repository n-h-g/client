import {Engine} from '../../../../Engine';
import {EventManager} from '../../../../core/events/EventManager';
import {LoadingProgressEventData} from '../../../../engine/events/ui/data/loader/LoadingProgress';
import {MessageHandler} from '../../../handler/MessageHandler';
import {OutgoingPacket} from '../../outgoing/OutgoingPacket';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {UIComponent} from '../../../../engine/ui/components/UIComponent';
import {GameLoaderUI} from '../../../../engine/ui/components/loader/GameLoaderUI';

export class LoginResponse extends MessageHandler {
    public handle(): void {
        if (Engine.getInstance().config.offlineMode) return;

        if (this.message.data) {
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
        } else
            Engine.getInstance()?.networkingManager?.webSocketManager?.disconnect();
    }
}
