
import BubbleActionClickable from "../../../core/game/messeger/bubble/actions/BubbleActionClickable";
import { Engine } from "../../../Engine";
import { BottomBarUI } from "../../ui/components/static/BottomBarUI";
import { UIComponent } from "../../ui/components/UIComponent";
import BubbleAction from "./bubble/actions/BubbleAction";
import { IBubbleAction } from "./bubble/actions/IBubbleAction";
import { BubbleActionTypes } from "./bubble/actions/types/BubbleActionTypes";
import DefaultBubbleAction from "./bubble/actions/types/DefaultBubbleAction";
import FriendBubbleAction from "./bubble/actions/types/FriendBubbleAction";
import PurchaseInfoAction from "./bubble/actions/types/PurchaseBubbleAction";
import BubbleMessage from "./bubble/BubbleMessage";
import FriendService from "./friends/FriendService";

//TODO REFACTOR
export default class Messenger {

    public friendsManager: FriendService

    public constructor() {
        this.friendsManager = new FriendService();
    }

    public addBubbleAlertMessage(message: string, actionType: string, goalId: number = -1) {
        let staticContainer = Engine.getInstance().userInterfaceManager?.componentsManager.getComponent(UIComponent.BottomBarUI) as BottomBarUI;

        let bubbleMessage = new BubbleMessage(message);
        bubbleMessage.setType(actionType);
  
        let action: IBubbleAction = this.getBubbleActionFromType(bubbleMessage.type, goalId);

        bubbleMessage.setAction(action); // id to sender

        //staticContainer.addBubbleAlert(bubbleMessage);
    }

    public getBubbleActionFromType(type: BubbleActionTypes, goalId: number = -1): IBubbleAction {
        let action: BubbleAction = new DefaultBubbleAction();

        switch(type){
            case BubbleActionTypes.PurchaseInfoAction:
                action = new PurchaseInfoAction();
                break;
            case BubbleActionTypes.FriendBubbleAction: 
                action = new FriendBubbleAction(goalId) as BubbleActionClickable;
                break;
             default: 
                action = new DefaultBubbleAction();
                break;
        }
        
        return action;
    }

}