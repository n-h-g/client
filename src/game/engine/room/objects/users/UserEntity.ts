import {Human} from '../../../../core/room/object/human/Human';
import {UserEntityLogic} from './logic/UserEntityLogic';
import {UserEntityVisualization} from './visualization/UserEntityVisualization';

export class UserEntity extends Human {
    userId: number | null = null;
    /** A bot: the user that owns it (null for the bots of the hotel), see isBot. */
    botOwnerId: number | null = null;
    isBot = false;

    constructor(id = '', name = '', look = '') {
        super(id, name, look);

        this.visualization = new UserEntityVisualization(this);
        this.logic = new UserEntityLogic(this);
    }
}
