import {Human} from '../../../../core/room/object/human/Human';
import UserEntityLogic from './logic/UserEntityLogic';
import UserEntityVisualization from './visualization/UserEntityVisualization';

export class UserEntity extends Human {
    public constructor(id = '', name = '', look = '') {
        super(id, name, look);

        this.visualization = new UserEntityVisualization(this);
        this.logic = new UserEntityLogic(this);
    }
}
