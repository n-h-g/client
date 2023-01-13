import { Engine } from "../../../../Engine";
import FloorItem from "../../../../engine/room/objects/items/FloorItem";
import WallItem from "../../../../engine/room/objects/items/WallItem";
import { UserEntity } from "../../../../engine/room/objects/users/UserEntity";
import UserEntityVisualization from "../../../../engine/room/objects/users/visualization/UserEntityVisualization";
import { ItemType } from "../../../../engine/ui/imagers/items/FurniImager";
import Point3d from "../../../../utils/point/Point3d";
import { IAspectComponent } from "./components/IAspectComponent";
import { IHeadBodyRotationComponent } from "./components/IHeadBodyRotation";
import { IPositionComponent } from "./components/IPositionComponent";
import { IUserComponent } from "./components/IUserComponent";
import { Entity } from "./Entity";
import { EntityType } from "./EntityType";

export class EntityBuilder {

    private static _entity: Entity

    private static _id: string

    private static _name: string

    private static _type: EntityType

    private static _position: IPositionComponent

    private static _bodyRotation?: number

    private static _headRotation?: number

    private static _user?: IUserComponent

    private static _figure?: IAspectComponent

    public static setId(id: string) {
        this._id = id;
        return this
    }

    public static setFigure(figure: IAspectComponent) {

        this._figure = figure
        return this
    }

    public static setType(type: EntityType) {
        this._type = type
        return this
    } 

    public static setUser(user: IUserComponent) {

        this._user = user
        this._entity = new UserEntity()
        return this
    }

    public static setPosition(position: IPositionComponent) {

        this._position = position
        return this
    }

    public static setHeadBodyRotation(headBodyRotation: IHeadBodyRotationComponent) {

        if(headBodyRotation) {
            this._bodyRotation = headBodyRotation.body_rot
            this._headRotation = headBodyRotation.head_rot
        }

        return this
    }

    public static setName(name: string) {
        this._name = name
        return this
    }

    private static async getEntityInstance() {

        let position = this._position ? new Point3d(this._position.x, this._position.y, this._position.z) : null

        let entity: Entity

        if(this._type == EntityType.HUMAN ) {
            if(this._user.id != null) {
                entity = new UserEntity(this._id, this._name, this._figure.look);
                entity.position = position
            }
            else {
             // return new BotVisualization()
            }
        } else if(this._type == EntityType.ITEM) 
        {
           let base = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniBase(ItemType.FloorItem, this._name)
           if(this._position != null) {
                entity = new FloorItem(this._id, this._name, position, base)
           } else {
            entity = new WallItem(this._id, this._name)
           }
        }

        return entity
    }

    public static async build() {
        let entity = await this.getEntityInstance()
        return entity;
    }

}