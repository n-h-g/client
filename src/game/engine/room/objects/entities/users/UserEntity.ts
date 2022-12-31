import Entity from "../../../../../core/room/object/entities/Entity";
import IUserController from "../../../../../core/users/IUserController";
import Point3d from "../../../../../utils/point/Point3d";
import User from "../../../../user/User";
import Room from "../../../Room";
import UserEntityLogic from "./logic/UserEntityLogic";
import UserEntityVisualization from "./visualization/UserEntityVisualization";

export default class UserEntity extends Entity {

    /**
     * The user that control this entity.
     */
    public user: IUserController | null;


    private look: string;

    public constructor(id: string, name: string, look: string, room: Room) {
        super(id, name, room);

        this.look = look;

        this.position = new Point3d(room.getRoomLayout().getDoorPosition().getX(), room.getRoomLayout().getDoorPosition().getY(), 0)

        this.visualization = new UserEntityVisualization(this)
        this.logic = new UserEntityLogic(this)

        this.user = null;
    }

    public get Look(): string { return this.look }
    public set Look(look: string) { this.look = look; }

}