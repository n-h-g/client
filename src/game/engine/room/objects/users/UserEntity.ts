import Human from '../../../../core/room/object/human/Human';
import { Entity } from '../../../../core/room/object/entities/Entity';
import Point3d from "../../../../utils/point/Point3d";
import Room from "../../Room";
import UserEntityLogic from "./logic/UserEntityLogic";
import UserEntityVisualization from "./visualization/UserEntityVisualization";

export class UserEntity extends Human{

    public constructor(id: string = "", name: string = "", look: string = "") {
        super(id, name, look);
        
        this.visualization = new UserEntityVisualization(this)
        this.logic = new UserEntityLogic(this)
    }
}