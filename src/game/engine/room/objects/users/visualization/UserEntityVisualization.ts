import Avatar from "../../../../ui/imagers/avatars/Avatar";
import { Direction } from "../../../../../core/objects/Direction";
import AvatarData from "../../../../ui/imagers/avatars/enum/AvatarData";
import MapData from "../../map/MapData";
import Point from "../../../../../utils/point/Point";
import UserEntityLogic from "../logic/UserEntityLogic";
import { Engine } from "../../../../../Engine";
import AvatarPlaceHolder from "../../../../ui/imagers/avatars/AvatarPlaceholder";
import { UserEntity } from '../UserEntity';
import { Tile } from '../../map/Tile';
import { ActionId } from "../../../../ui/imagers/avatars/enum/actions/ActionId";
import { HumanVisualization } from "../../../../../core/room/object/human/visualization/HumanVisualization";

export default class UserEntityVisualization extends HumanVisualization {

    constructor(entity: UserEntity) {
        super(entity)
        this._actions = new Set();
    }

    public getZIndex(): number {

        if (this.entity.position.getX() === Engine.getInstance().roomService?.CurrentRoom?.roomLayout.getDoorPosition().getX() && this.entity.position.getY() === Engine.getInstance().roomService?.CurrentRoom?.roomLayout.getDoorPosition().getY()) {
            return 3;
        }

        return (1 + Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY()) + ((Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY())) * 1000) + 4);
    }
}