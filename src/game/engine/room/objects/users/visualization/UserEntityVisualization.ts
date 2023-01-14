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
import Point3d from "../../../../../utils/point/Point3d";
import RoomVisualization from "../../../visualization/RoomVisualization";
import { RoomPriority } from "../../../visualization/RoomPriority";

export default class UserEntityVisualization extends HumanVisualization {

    constructor(entity: UserEntity) {
        super(entity)
        this._actions = new Set();
    }

    public getZIndex(): number {
        return RoomVisualization.calculateZIndex(new Point3d(this.entity.position.getX(), this.entity.position.getY(), this.entity.position.getZ() + 0.001), RoomPriority.USER)
    }
}