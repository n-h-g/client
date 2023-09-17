import {Engine} from '../../../../Engine';
import {FloorItem} from '../../../../engine/room/objects/items/FloorItem';
import {WallItem} from '../../../../engine/room/objects/items/WallItem';
import {UserEntity} from '../../../../engine/room/objects/users/UserEntity';
import {FurnidataItemType} from '../../../../engine/ui/imagers/items/enum/FurniDataItemType';
import {Point3d} from '../../../../utils/point/Point3d';
import {AspectComponent} from './components/AspectComponent';
import {HeadBodyRotationComponent} from './components/HeadBodyRotation';
import {PositionComponent} from './components/PositionComponent';
import {UserComponent} from './components/UserComponent';
import {Entity} from './Entity';
import {EntityType} from './EntityType';

export class EntityBuilder {
    private _id: string;
    private _name: string;
    private _type: EntityType;
    private _position: PositionComponent;
    private _bodyRotation?: number;
    private _headRotation?: number;
    private _user?: UserComponent;
    private _figure?: AspectComponent;

    setId(id: string) {
        this._id = id;
        return this;
    }

    setFigure(figure: AspectComponent) {
        this._figure = figure;
        return this;
    }

    setType(type: EntityType) {
        this._type = type;
        return this;
    }

    setUser(user: UserComponent) {
        this._user = user;
        return this;
    }

    setPosition(position: PositionComponent) {
        this._position = position;
        return this;
    }

    setHeadBodyRotation(headBodyRotation: HeadBodyRotationComponent) {
        if (headBodyRotation) {
            this._bodyRotation = headBodyRotation.body_rot;
            this._headRotation = headBodyRotation.head_rot;
        }

        return this;
    }

    setName(name: string) {
        this._name = name;
        return this;
    }

    async build() {
        const entity = await this.getEntityInstance();
        return entity;
    }

    private async getEntityInstance() {
        const position = this._position
            ? new Point3d(this._position.x, this._position.y, this._position.z)
            : null;

        let entity: Entity;

        if (this._type == EntityType.HUMAN) {
            if (this._user.id != null) {
                entity = new UserEntity(
                    this._id,
                    this._name,
                    this._figure.look
                );
                entity.position = position;
            } else {
                
            }
        } else if (this._type == EntityType.ITEM) {
            const base =
                await Engine.getInstance().userInterfaceManager.furniImager.loadFurniBase(
                    FurnidataItemType.FloorItem,
                    this._name
                );
            if (this._position != null) {
                entity = new FloorItem(this._id, this._name, position, base);
            } else {
                entity = new WallItem(this._id, this._name);
            }
        }

        return entity;
    }
}
