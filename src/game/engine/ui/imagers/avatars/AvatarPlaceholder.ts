import {Direction} from '../../../../core/objects/Direction';
import Avatar from './Avatar';
import {ActionId} from './enum/actions/ActionId';
import AvatarData from './enum/AvatarData';

export default class AvatarPlaceHolder extends Avatar {
    constructor(
        figure = 'hd-180-1.lg-3216-110',
        bodyDirection: Direction = AvatarData.DEFAULT_DIRECTION,
        headDirecton: Direction = AvatarData.DEFAULT_DIRECTION,
        actions: Set<ActionId> = new Set(),
        bodyFrame = 0,
        headFrame = 0,
        placeholder = true
    ) {
        super(
            'hd-180-1.lg-3216-110',
            bodyDirection,
            headDirecton,
            actions,
            bodyFrame,
            headFrame,
            false,
            true
        );
    }
}
