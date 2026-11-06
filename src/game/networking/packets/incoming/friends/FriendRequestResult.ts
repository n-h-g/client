import {EventManager} from '../../../../core/events/EventManager';
import {BubbleAlertData} from '../../../../engine/events/ui/data/general/BubbleAlertData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** Result of the friendship request the user sent, or why a follow/message failed: {status, username}. */
export class FriendRequestResult extends MessageHandler {
    handle(): void {
        const {status, username} = this.message ?? {};

        const messages: Record<string, string> = {
            REQUESTED: `Richiesta di amicizia inviata a ${username}`,
            ACCEPTED: `Ora tu e ${username} siete amici`,
            ALREADY_FRIENDS: `Tu e ${username} siete già amici`,
            ALREADY_REQUESTED: `Hai già inviato una richiesta a ${username}`,
            NOT_FOUND: `Nessun utente si chiama ${username}`,
            INVALID: 'Non puoi aggiungere te stesso',
            NOT_FRIEND: `${username || 'Questo utente'} non è tuo amico`,
            FOLLOW_OFFLINE: `${username} non è online`,
            FOLLOW_NOT_IN_ROOM: `${username} non è in una stanza`,
            FOLLOW_SAME_ROOM: `Sei già nella stanza di ${username}`,
            MESSAGE_OFFLINE: `${username} non è online: il messaggio non è stato inviato`,
            UNAVAILABLE: 'Gli amici non sono disponibili, riprova più tardi',
        };

        EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, {
            message: messages[status] ?? messages.UNAVAILABLE,
        });
    }
}
