import { Engine } from '../../../../Engine'
import FloorItem from '../../../../engine/room/objects/items/FloorItem'
import WallItem from '../../../../engine/room/objects/items/WallItem'
import { UserEntity } from '../../../../engine/room/objects/users/UserEntity'
import { FurnidataItemType } from '../../../../engine/ui/imagers/items/enum/FurniDataItemType'
import Point3d from '../../../../utils/point/Point3d'
import { IAspectComponent } from './components/IAspectComponent'
import { IHeadBodyRotationComponent } from './components/IHeadBodyRotation'
import { IPositionComponent } from './components/IPositionComponent'
import { IUserComponent } from './components/IUserComponent'
import { Entity } from './Entity'
import { EntityType } from './EntityType'

export class EntityBuilder {
    public _entity: Entity
    private _id: string
    private _name: string
    private _type: EntityType
    private _position: IPositionComponent
    private _bodyRotation?: number
    private _headRotation?: number
    private _user?: IUserComponent
    private _figure?: IAspectComponent

    public setId(id: string) {
        this._id = id
        return this
    }

    public setFigure(figure: IAspectComponent) {
        this._figure = figure
        return this
    }

    public setType(type: EntityType) {
        this._type = type
        return this
    }

    public setUser(user: IUserComponent) {
        this._user = user
        this._entity = new UserEntity()
        return this
    }

    public setPosition(position: IPositionComponent) {
        this._position = position
        return this
    }

    public setHeadBodyRotation(headBodyRotation: IHeadBodyRotationComponent) {
        if (headBodyRotation) {
            this._bodyRotation = headBodyRotation.body_rot
            this._headRotation = headBodyRotation.head_rot
        }

        return this
    }

    public setName(name: string) {
        this._name = name
        return this
    }

    private async getEntityInstance() {
        let position = this._position ? new Point3d(this._position.x, this._position.y, this._position.z) : null

        let entity: Entity

        if (this._type == EntityType.HUMAN) {
            if (this._user.id != null) {
                entity = new UserEntity(this._id, this._name, this._figure.look)
                entity.position = position
            }
            else {
                // return new BotVisualization()
            }
        } else if (this._type == EntityType.ITEM) {
            let base = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniBase(FurnidataItemType.FloorItem, this._name)
            if (this._position != null) {
                entity = new FloorItem(this._id, this._name, position, base)
            } else {
                entity = new WallItem(this._id, this._name)
            }
        }

        return entity
    }

    public async build() {
        let entity = await this.getEntityInstance()
        return entity
    }
}