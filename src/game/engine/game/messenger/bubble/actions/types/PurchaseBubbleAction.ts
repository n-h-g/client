import BubbleAction from "../BubbleAction";
import BubbleActionClickable from "../../../../../../core/game/messeger/bubble/actions/BubbleActionClickable";

export default class PurchaseInfoAction extends BubbleAction implements BubbleActionClickable {

    private destinationId: number

    public constructor(destinationId: number = -1) {
        super();

        this.destinationId = destinationId;
    }

    onConfirm(): void {
        
    }
    onDecline(): void {
        
    }

    public isClickable(): boolean {
       return true;
    }

    public setDestinationId(destinationId: number) {
        this.destinationId = destinationId
    }

}