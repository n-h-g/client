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
    private id: string;
    private name: string;
    private type: EntityType;
    private position: PositionComponent;
    private bodyRotation?: number;
    private headRotation?: number;
    private user?: UserComponent;
    private figure?: AspectComponent;

    setId(id: string): EntityBuilder {
        this.id = id;
        return this;
    }

    setFigure(figure: AspectComponent): EntityBuilder {
        this.figure = figure;
        return this;
    }

    setType(type: EntityType): EntityBuilder {
        this.type = type;
        return this;
    }

    setUser(user: UserComponent): EntityBuilder {
        this.user = user;
        return this;
    }

    setPosition(position: PositionComponent): EntityBuilder {
        this.position = position;
        return this;
    }

    setHeadBodyRotation(headBodyRotation: HeadBodyRotationComponent): EntityBuilder {
        if (headBodyRotation) {
            this.bodyRotation = headBodyRotation.body_rot;
            this.headRotation = headBodyRotation.head_rot;
        }

        return this;
    }

    setName(name: string): EntityBuilder {
        this.name = name;
        return this;
    }

    async build(): Promise<Entity> {
        const entity = await this.getEntityInstance();
        return entity;
    }

    private async getEntityInstance(): Promise<Entity> {
        const position = this.position
            ? new Point3d(this.position.x, this.position.y, this.position.z)
            : null;

        let entity: Entity;

        if (this.type == EntityType.HUMAN) {
            if (this.user.id != null) {
                entity = new UserEntity(
                    this.id,
                    this.name,
                    this.figure.look
                );
                entity.position = position;
            }
        } else if (this.type == EntityType.ITEM) {
            const base =
                await Engine.getInstance().userInterfaceManager.furniImager.loadFurniBase(
                    FurnidataItemType.FloorItem,
                    this.name
                );
            if (this.position != null) {
                entity = new FloorItem(this.id, this.name, position, base);
            } else {
                entity = new WallItem(this.id, this.name);
            }
        }

        return entity;
    }
}
