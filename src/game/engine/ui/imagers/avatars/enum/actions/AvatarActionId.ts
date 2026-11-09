import {ActionId} from './ActionId';

export class AvatarActionId {
    static idToAvatarActionState(id: ActionId): string {
        switch (id) {
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
            case ActionId.SIGN:
                return 'sign';
            case ActionId.BLOW:
                return 'blow';
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
                return 'laugh';
            // the expressions of the face (HabboAvatarActions: the "gesture" part set, the eyes and the face)
            case ActionId.SMILE:
                return 'sml';
            case ActionId.SAD:
                return 'sad';
            case ActionId.ANGRY:
                return 'agr';
            case ActionId.SURPRISED:
                return 'srp';
            default:
            case ActionId.STAND:
                return 'std';
        }
    }
}
