import Action from "../../actions/Action";
import { ActionId } from "./ActionId";

export default class AvatatActionId {

    public static idToAvatarActionState(id: ActionId): string
    {
        switch(id) {
            case ActionId.LAY:
                return 'lay';
            case ActionId.FLOAT:
                return 'float';
            case ActionId.SWIM:
                return 'lay';   
            case ActionId.SIT:
                return 'sit';
            case ActionId.RESPECT:   
                return 'respect';
            case ActionId.WAVE:
                return 'wave';
            case ActionId.IDLE:
                return 'idle';  
            case ActionId.DANCE:
                return 'dance';
            case ActionId.USE_ITEM:
                return 'usei';
            case ActionId.CARRY_ITEM:
                return 'cri';
            case ActionId.TALK:
                return 'talk';
            case ActionId.SLEEP:
                return 'sleep';
            case ActionId.WALK:
                return 'wlk';
            case ActionId.LAUGH:
                return 'lag';
            default:
            case ActionId.STAND:
                return 'std';                             
        }
    }

}