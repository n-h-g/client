import BubbleAction from "../BubbleAction";
import BubbleActionClickable from "../../../../../../core/game/messeger/bubble/actions/BubbleActionClickable";
import { OutgoingPacket } from '../../../../../../networking/packets/outgoing/OutgoingPacket';
import { Engine } from '../../../../../../Engine';

export default class FriendBubbleAction extends BubbleAction implements BubbleActionClickable {

    private destinationId: number

    public constructor(destinationId: number = -1) {
        super();

        this.destinationId = destinationId;
    }

    onConfirm(): void {
        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.FriendRequestEvent, {
            id: this.destinationId
        })
    }
    onDecline(): void {
        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.DeclineFriendRequestEvent, {
            id: this.destinationId
        })
    }

    public isClickable(): boolean {
       return true;
    }

    public setDestinationId(destinationId: number) {
        this.destinationId = destinationId
    }

}