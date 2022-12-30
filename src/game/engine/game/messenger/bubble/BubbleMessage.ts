import { IBubbleAction } from "./actions/IBubbleAction";
import { BubbleActionTypes } from "./actions/types/BubbleActionTypes";
import DefaultBubbleAction from "./actions/types/DefaultBubbleAction";

export default class BubbleMessage{

    public action: IBubbleAction;
    public type: BubbleActionTypes;
    
    public constructor(message: string) {
        
        this.action = new DefaultBubbleAction();
        this.type = BubbleActionTypes.DefaultBubbleAction;
    }

    public compose(): void {
        throw new Error("Method not implemented.");
    }

    public isClickable(): boolean {
        return this.action.isClickable();
    }

    public setAction(action: IBubbleAction) {
        this.action = action;
    }
    public setType(type: string): void {
        switch(type) {
            case 'Default':
                this.type = BubbleActionTypes.DefaultBubbleAction
                break;
            case 'Friend':
                this.type = BubbleActionTypes.FriendBubbleAction;
                break;
            case 'Purchase':
                this.type = BubbleActionTypes.PurchaseInfoAction;
        }
    }
}