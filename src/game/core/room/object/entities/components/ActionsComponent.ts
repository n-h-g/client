import {ActionId} from '../../../../../engine/ui/imagers/avatars/enum/actions/ActionId';

export interface ActionsComponent {
    actions: Array<ActionId>;
    danceStyle?: number;
    signValue?: number;
    /** Sitting/laying on a furni (a seat, a bath, a bed) and not on the floor: no shadow, as Nitro. */
    onFurni?: boolean;
}
