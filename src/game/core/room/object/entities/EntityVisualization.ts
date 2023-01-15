import { Direction } from "../../../objects/Direction";
import RoomObjectVisualization from "../RoomObjectVisualization";
import { Entity } from "./Entity";
import Point3d from '../../../../utils/point/Point3d';

import AvatarData from "../../../../engine/ui/imagers/avatars/enum/AvatarData";
import { EntityEvents } from "../../../../engine/events/room/objects/entities/EntityEvents";
import { RoomPriority } from "../../../../engine/room/visualization/RoomPriority";
import { Engine } from "../../../../Engine";

export abstract class EntityVisualization extends RoomObjectVisualization {

    protected _entity: Entity

    protected rotation: Direction = Direction.SOUTH

    /**
     * The next position the entity will reach
     */
    private _nextPosition: Point3d

    public frame: number = 0

    constructor(entity: Entity) {
        super(0, 0, 0);
        this._entity = entity;
        this._nextPosition = new Point3d(0, 0, 0);
    }

    public setNextPosition(point: Point3d) {

        this._nextPosition.setX(point.getX());
        this._nextPosition.setY(point.getY());
        this._nextPosition.setZ(point.getZ());
        //this.rotation = Rotation.calculateDirection(new Point(this._entity.position.getX(), this._entity.position.getY()), new Point(this.entity.position.getX(), this.entity.position.getY()));
        this.updatePosition()
        this.entity.logic.events.emit(EntityEvents.POSITION_CHANGED);
    }

    public move(delta: number): void {
        delta = delta / 1000;
        
        if (this._entity.position.getX() < this._nextPosition.getX()) {
            this._entity.position.setX(this._entity.position.getX() + delta * AvatarData.AVATAR_WALK_SPEED);
            if (this._entity.position.getX() > this._nextPosition.getX()) {
                //this.isWalking = false;
                this._entity.position.setX(this._nextPosition.getX());
            }
        } else if (this._entity.position.getX() > this._nextPosition.getX()) {
            this._entity.position.setX(this._entity.position.getX() - delta * AvatarData.AVATAR_WALK_SPEED);
            if (this._entity.position.getX() < this._nextPosition.getX()) {
                //this.isWalking = false;
                this._entity.position.setX(this._nextPosition.getX());
            }
        }

        if (this._entity.position.getY() < this._nextPosition.getY()) {
            this._entity.position.setY(this._entity.position.getY() + delta * AvatarData.AVATAR_WALK_SPEED);
            if (this._entity.position.getY() > this._nextPosition.getY()) {
                //this.isWalking = false;
                this._entity.position.setY(this._nextPosition.getY());
            }
        } else if (this._entity.position.getY() > this._nextPosition.getY()) {
            this._entity.position.setY(this._entity.position.getY() - delta * AvatarData.AVATAR_WALK_SPEED);
            if (this._entity.position.getY() < this._nextPosition.getY()) {
                //this.isWalking = false;
                this._entity.position.setY(this._nextPosition.getY());
            }
        }

        if (this._nextPosition.getZ() > this._entity.position.getZ()) {
            this._entity.position.setZ(this._entity.position.getZ() + ((Math.abs(this.entity.position.getZ() - this.nextPosition.getZ()) > 1.5) ? 9.8 : AvatarData.AVATAR_WALK_SPEED) * delta);
            if (this._entity.position.getZ() > this._nextPosition.getZ()) {
                this._entity.position.setZ(this._nextPosition.getZ());
            }
        } else if (this.nextPosition.getZ() < this._entity.position.getZ()) {
            this._entity.position.setZ(this._entity.position.getZ() - ((Math.abs(this._entity.position.getZ() - this._nextPosition.getZ()) > 1.5) ? 9.8 : AvatarData.AVATAR_WALK_SPEED) * delta);
            if (this._entity.position.getZ() < this._nextPosition.getZ()) {
                this._entity.position.setZ(this._nextPosition.getZ());
            }
        }

        this.updatePosition()
    }


    public abstract draw(): void

    public abstract nextFrame(): void

    public abstract calculateOffsetX()

    public abstract calculateOffsetY()

    public abstract getZIndex(): number;

    public updatePosition() {
        this.container.x = this.calculateOffsetX()
        this.container.y = this.calculateOffsetY()
        this.container.zIndex = this.getZIndex()

        this.container.interactive = true
        this.container.buttonMode = true
    }

    public set direction(direction: Direction) {
        this.rotation = direction;
    }

    public get entity(): Entity {
        return this._entity;
    }

    public set Rot(direction: Direction) {
        this.rotation = direction;
    }

    public get nextPosition(): Point3d {
        return this._nextPosition
    }

    public set nextPosition(point: Point3d) {
        this.nextPosition = point
    }
}