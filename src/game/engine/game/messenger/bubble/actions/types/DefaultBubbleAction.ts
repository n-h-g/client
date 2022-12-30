import BubbleAction from "../BubbleAction";
import BubbleActionDefault from "../../../../../../core/game/messeger/bubble/actions/BubbleActionDefault";

export default class DefaultBubbleAction extends BubbleAction implements BubbleActionDefault {
    public isClickable(): boolean {
        return false;
    }
}