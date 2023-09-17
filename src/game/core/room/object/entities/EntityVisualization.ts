import {Direction} from '../../../objects/Direction';
import {RoomObjectVisualization} from '../RoomObjectVisualization';
import {Entity} from './Entity';
import {Point3d} from '../../../../utils/point/Point3d';
import {AvatarData} from '../../../../engine/ui/imagers/avatars/enum/AvatarData';
import {EntityEvents} from '../../../../engine/events/room/objects/entities/EntityEvents';
import {Engine} from '../../../../Engine';

export abstract class EntityVisualization extends RoomObjectVisualization {
    entity: Entity;
    frame = 0;
	direction: Direction = Direction.SOUTH;
    protected nextPosition: Point3d;

    constructor(entity: Entity) {
        super(0, 0, 0);
        this.entity = entity;
        this.nextPosition = new Point3d(0, 0, 0);
    }

    setNextPosition(point: Point3d) {
        this.nextPosition.x = point.x;
        this.nextPosition.y = point.y;
        this.nextPosition.z = point.z;
        this.entity.logic.events.emit(EntityEvents.POSITION_CHANGED);
        this.updatePosition();
    }

    move(delta: number): void {
        delta = delta / 1000;

        if (this.entity.position.x < this.nextPosition.x) {
            this.entity.position.x =
                this.entity.position.x +
                    delta * AvatarData.AVATAR_WALK_SPEED;
            if (this.entity.position.x > this.nextPosition.x) {
                this.entity.position.x = this.nextPosition.x;
            }
        } else if (this.entity.position.x > this.nextPosition.x) {
            this.entity.position.x = 
                this.entity.position.x -
                    delta * AvatarData.AVATAR_WALK_SPEED;
            if (this.entity.position.x < this.nextPosition.x) {
                this.entity.position.x = this.nextPosition.x;
            }
        }

        if (this.entity.position.y < this.nextPosition.y) {
            this.entity.position.y = this.entity.position.y + delta * AvatarData.AVATAR_WALK_SPEED;

            if (this.entity.position.y > this.nextPosition.y) {
                this.entity.position.y = this.nextPosition.y;
            }
        } else if (this.entity.position.y > this.nextPosition.y) {
            this.entity.position.y = this.entity.position.y - delta * AvatarData.AVATAR_WALK_SPEED;

            if (this.entity.position.y < this.nextPosition.y) {
                this.entity.position.y = this.nextPosition.y;
            }
        }

        if (this.nextPosition.z > this.entity.position.z) {
            this.entity.position.z = 
                this.entity.position.z +
                    (Math.abs(this.entity.position.z - this.nextPosition.z) > 1.5
                        ? 9.8
                        : AvatarData.AVATAR_WALK_SPEED) *
                        delta;

            if (this.entity.position.z > this.nextPosition.z) {
                this.entity.position.z = this.nextPosition.z;
            }
        } else if (this.nextPosition.z < this.entity.position.z) {
            this.entity.position.z = 
                this.entity.position.z -
                    (Math.abs(
                        this.entity.position.z - this.nextPosition.z
                    ) > 1.5
                        ? 9.8
                        : AvatarData.AVATAR_WALK_SPEED) *
                        delta;

            if (this.entity.position.z < this.nextPosition.z) {
                this.entity.position.z = this.nextPosition.z;
            }
        }

        this.updatePosition();
    }

    updatePosition() {
        if (!this.container) return;

        this.container.x = this.calculateOffsetX();
        this.container.y = this.calculateOffsetY();

        this.container.zIndex = this.getZIndex();
        this.container.eventMode = 'dynamic';
        this.container.cursor = 'pointer';

        this.entity.logic.events.emit(EntityEvents.POSITION_CHANGED);

        Engine.getInstance().roomService.CurrentRoom.roomLayout.visualization.container.sortChildren();
    }

    dispose(): void {
        super.dispose();
    }

    abstract draw(): void;

    abstract nextFrame(): void;

    abstract calculateOffsetX(): number;

    abstract calculateOffsetY(): number;

    abstract updateRotation(rotation: number): void;

    abstract getZIndex(): number;
}
