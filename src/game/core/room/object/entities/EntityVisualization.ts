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

    /** A slide in progress (moved by a roller), null if none: see slideTo. */
    private slide: {fromX: number; fromY: number; fromZ: number; start: number; duration: number} | null = null;

    /**
     * Slides the entity to the given position in the given time, without walking (as Nitro's MovingObjectLogic for
     * the furni and the avatars moved by a roller).
     */
    slideTo(point: Point3d, duration: number): void {
        const position = this.entity.position;
        this.slide = {fromX: position.x, fromY: position.y, fromZ: position.z, start: performance.now(), duration: Math.max(1, duration)};

        this.nextPosition.x = point.x;
        this.nextPosition.y = point.y;
        this.nextPosition.z = point.z;
    }

    /**
     * Moves the entity along its slide (see slideTo), called at every tick.
     *
     * @return true while it's sliding.
     */
    updateSlide(): boolean {
        if (!this.slide) return false;

        const t = Math.min(1, (performance.now() - this.slide.start) / this.slide.duration);
        const position = this.entity.position;

        position.x = this.slide.fromX + (this.nextPosition.x - this.slide.fromX) * t;
        position.y = this.slide.fromY + (this.nextPosition.y - this.slide.fromY) * t;
        position.z = this.slide.fromZ + (this.nextPosition.z - this.slide.fromZ) * t;

        if (t >= 1) this.slide = null;

        this.updatePosition();

        return true;
    }

    setNextPosition(point: Point3d) {
        // a walk or a new position from the server ends the slide
        this.slide = null;
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

    /**
     * Moves the entity directly to the next position, without interpolation.
     * Used when the entity is not walking (e.g. its height changes because
     * an item is placed under it, or it's a furni moved by the server).
     */
    snapToNextPosition(): void {
        this.slide = null;
        this.entity.position.x = this.nextPosition.x;
        this.entity.position.y = this.nextPosition.y;
        this.entity.position.z = this.nextPosition.z;

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

        Engine.getInstance().roomService.currentRoom.roomLayout.visualization.container.sortChildren();
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
