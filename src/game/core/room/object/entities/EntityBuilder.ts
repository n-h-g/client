import {Engine} from '../../../../Engine';
import {FloorItem} from '../../../../engine/room/objects/items/FloorItem';
import type {ItemVisualization} from '../items/visualization/ItemVisualization';
import {WallItem} from '../../../../engine/room/objects/items/WallItem';
import {UserEntity} from '../../../../engine/room/objects/users/UserEntity';
import {FurnidataItemType} from '../../../../engine/ui/imagers/items/enum/FurniDataItemType';
import {Point3d} from '../../../../utils/point/Point3d';
import {AspectComponent} from './components/AspectComponent';
import {ActionsComponent} from './components/ActionsComponent';
import {ActionId} from '../../../../engine/ui/imagers/avatars/enum/actions/ActionId';
import {HeadBodyRotationComponent} from './components/HeadBodyRotation';
import {PositionComponent} from './components/PositionComponent';
import {UserComponent} from './components/UserComponent';
import {Entity} from './Entity';
import {EntityType} from './EntityType';
import { FurnitureWallData } from '../../../../engine/room/objects/items/WallItemData';
import type {HumanVisualization} from '../human/visualization/HumanVisualization';

export class EntityBuilder {
    private id: string;
    private name: string;
    private type: EntityType;
    private position: PositionComponent;
    private bodyRotation?: number;
    private headRotation?: number;
    private rotation?: number;
    private state = 0;
    private extraData: number | string | null = null;
    private user?: UserComponent;
    private figure?: AspectComponent;
    private wallPosition?: string;
    private effectId = 0;
    private bot?: {id: number; ownerId: number | null};
    private handItemId = 0;
    private actions?: ActionsComponent;
    private stackHeight: number | null = null;
    private allowStack = true;

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

    /**
     * State of a furni (extraData): the animation it shows.
     */
    setState(interaction?: {extraData?: number | string}): EntityBuilder {
        const state = Number(interaction?.extraData);
        this.state = Number.isFinite(state) && state >= 0 ? state : 0;
        this.extraData = interaction?.extraData ?? null;

        return this;
    }

    setRotation(rotation?: {rot: number}): EntityBuilder {
        if (rotation) {
            this.rotation = rotation.rot;
        }

        return this;
    }

    /** A furni: the stack height of the server and if something can be placed on it. */
    setItem(item?: {height?: number; allowStack?: boolean}): EntityBuilder {
        this.stackHeight = typeof item?.height === 'number' ? item.height : null;
        this.allowStack = item?.allowStack ?? true;
        return this;
    }

    /**
     * The actions of a human when it's loaded (e.g. a user already sitting or dancing when the room is entered):
     * without them it was drawn standing (with its shadow) until its next update.
     */
    setActions(actions?: ActionsComponent): EntityBuilder {
        this.actions = actions;
        return this;
    }

    /** The avatar effect of a human. */
    setEffect(effect?: {id: number}): EntityBuilder {
        this.effectId = effect?.id ?? 0;
        return this;
    }

    /** A bot (a human without user). */
    setBot(bot?: {id: number; ownerId: number | null}): EntityBuilder {
        this.bot = bot;
        return this;
    }

    /** What a human carries in its hand. */
    setHandItem(handItem?: {id: number}): EntityBuilder {
        this.handItemId = handItem?.id ?? 0;
        return this;
    }

    setName(name: string): EntityBuilder {
        this.name = name;
        return this;
    }

    setWallPosition(wallPosition?: string): EntityBuilder {
        this.wallPosition = wallPosition;
        return this;
    }

    async build(): Promise<Entity> {
        const entity = await this.getEntityInstance();
        return entity;
    }

    private applyActions(visualization: HumanVisualization): void {
        if (!this.actions) return;

        visualization.danceStyle = this.actions.danceStyle ?? 1;
        visualization.signValue = this.actions.signValue ?? 1;
        visualization.onFurni = this.actions.onFurni ?? false;

        // a user walking goes on with the next updates of the server: here it stands
        for (const action of this.actions.actions ?? []) {
            if (action !== ActionId.WALK) visualization.addAction(action);
        }
    }

    private async getEntityInstance(): Promise<Entity> {
        const position = this.position
            ? new Point3d(this.position.x, this.position.y, this.position.z)
            : null;

        let entity: Entity;

        if (this.type == EntityType.HUMAN) {
            // a user, or a bot (no user: it crashed here, the bots were not shown)
            if (this.user?.id != null || this.bot) {
                entity = new UserEntity(
                    this.id,
                    this.name,
                    this.figure.look
                );
                const human = entity as UserEntity;
                human.userId = this.user?.id ?? null;
                human.isBot = !!this.bot;
                human.botOwnerId = this.bot?.ownerId ?? null;
                entity.position = position;
                const visualization = entity.visualization as HumanVisualization;
                if (this.bodyRotation != null) visualization.direction = this.bodyRotation;
                if (this.headRotation != null) visualization.headRotation = this.headRotation;
                visualization.setEffect(this.effectId);
                visualization.setHandItem(this.handItemId);
                this.applyActions(visualization);
            }
        } else if (this.type == EntityType.ITEM) {
            const isWallItem = !!this.wallPosition || this.position == null;
            const base =
                await Engine.getInstance().userInterfaceManager.furniImager.loadFurniBase(
                    isWallItem ? FurnidataItemType.WallItem : FurnidataItemType.FloorItem,
                    this.name
                );
            if (!isWallItem) {
                entity = new FloorItem(this.id, this.name, position, base);

                // the furni must be drawn with the rotation sent by the server,
                // otherwise e.g. a chair is shown in a direction different from the one used to sit
                if (this.rotation != null) {
                    entity.visualization.direction = this.rotation;
                }

                (entity.visualization as ItemVisualization).state = this.state;
                (entity as FloorItem).stackHeight = this.stackHeight;
                (entity as FloorItem).allowStack = this.allowStack;
                (entity as FloorItem).extraData = this.extraData;
            } else {
                const wallData = this.wallPosition
                    ? FurnitureWallData.fromLocation(this.wallPosition)
                    : new FurnitureWallData({localX: 0, localY: 0, width: 0, height: 0, y: 0, z: 0, direction: 2, stuffData: '', secondsToExpiration: 0, isOldFormat: false});
                entity = new WallItem(this.id, this.name, base, wallData);

                // e.g. a room dimmer on/off
                (entity.visualization as ItemVisualization).state = this.state;
                (entity as WallItem).extraData = this.extraData;
            }
        }

        return entity;
    }
}
