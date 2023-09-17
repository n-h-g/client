import {Direction} from '../../../objects/Direction';
import {RoomObjectVisualization} from '../RoomObjectVisualization';
import {Entity} from './Entity';
import {Point3d} from '../../../../utils/point/Point3d';
import {AvatarData} from '../../../../engine/ui/imagers/avatars/enum/AvatarData';
import {EntityEvents} from '../../../../engine/events/room/objects/entities/EntityEvents';
import {Engine} from '../../../../Engine';

export abstract class EntityVisualization extends RoomObjectVisualization {
    _entity: Entity;

    protected rotation: Direction = Direction.SOUTH;
    private _nextPosition: Point3d;
    frame = 0;

    constructor(entity: Entity) {
        super(0, 0, 0);
        this._entity = entity;
        this._nextPosition = new Point3d(0, 0, 0);
    }

    setNextPosition(point: Point3d) {
        this._nextPosition.x = point.x;
        this._nextPosition.y = point.y;
        this._nextPosition.z = point.z;
        this.entity.logic.events.emit(EntityEvents.POSITION_CHANGED);
        this.updatePosition();
    }

    move(delta: number): void {
        delta = delta / 1000;

        if (this._entity.position.x < this._nextPosition.x) {
            this._entity.position.x =
                this._entity.position.x +
                    delta * AvatarData.AVATAR_WALK_SPEED;
            if (this._entity.position.x > this._nextPosition.x) {
                //this.isWalking = false
                this._entity.position.x = this._nextPosition.x;
            }
        } else if (this._entity.position.x > this._nextPosition.x) {
            this._entity.position.x = 
                this._entity.position.x -
                    delta * AvatarData.AVATAR_WALK_SPEED;
            if (this._entity.position.x < this._nextPosition.x) {
                //this.isWalking = false
                this._entity.position.x = this._nextPosition.x;
            }
        }

        if (this._entity.position.y < this._nextPosition.y) {
            this._entity.position.y = this._entity.position.y + delta * AvatarData.AVATAR_WALK_SPEED;

            if (this._entity.position.y > this._nextPosition.y) {
                //this.isWalking = false
                this._entity.position.y = this._nextPosition.y;
            }
        } else if (this._entity.position.y > this._nextPosition.y) {
            this._entity.position.y = this._entity.position.y - delta * AvatarData.AVATAR_WALK_SPEED;

            if (this._entity.position.y < this._nextPosition.y) {
                //this.isWalking = false
                this._entity.position.y = this._nextPosition.y;
            }
        }

        if (this._nextPosition.z > this._entity.position.z) {
            this._entity.position.z = 
                this._entity.position.z +
                    (Math.abs(this.entity.position.z - this.nextPosition.z) > 1.5
                        ? 9.8
                        : AvatarData.AVATAR_WALK_SPEED) *
                        delta;

            if (this._entity.position.z > this._nextPosition.z) {
                this._entity.position.z = this._nextPosition.z;
            }
        } else if (this.nextPosition.z < this._entity.position.z) {
            this._entity.position.z = 
                this._entity.position.z -
                    (Math.abs(
                        this._entity.position.z - this._nextPosition.z
                    ) > 1.5
                        ? 9.8
                        : AvatarData.AVATAR_WALK_SPEED) *
                        delta;

            if (this._entity.position.z < this._nextPosition.z) {
                this._entity.position.z = this._nextPosition.z;
            }
        }

        this.updatePosition();
    }

    abstract draw(): void;

    abstract nextFrame(): void;

    abstract calculateOffsetX(): number;

    abstract calculateOffsetY(): number;

    abstract updateRotation(rotation: number): void;

    abstract getZIndex(): number;

    updatePosition() {
        if (!this.container) return;

        this.container.x = this.calculateOffsetX();
        this.container.y = this.calculateOffsetY();

        this.container.zIndex = this.getZIndex();
        this.container.eventMode = 'dynamic';
        this.container.cursor = 'pointer';

        this.entity.logic.events.emit(EntityEvents.POSITION_CHANGED);

        Engine.getInstance().roomService.CurrentRoom.roomLayout.Visualization.container.sortChildren();
    }

    dispose(): void {
        super.dispose();
    }

    set direction(direction: Direction) {
        this.rotation = direction;
    }

    get entity(): Entity {
        return this._entity;
    }

    set Rot(direction: Direction) {
        this.rotation = direction;
    }

    get nextPosition(): Point3d {
        return this._nextPosition;
    }

    set nextPosition(point: Point3d) {
        this.nextPosition = point;
    }
}
