import {Direction} from '../../../objects/Direction';
import {RoomObjectVisualization} from '../RoomObjectVisualization';
import {Entity} from './Entity';
import {Point3d} from '../../../../utils/point/Point3d';
import {AvatarData} from '../../../../engine/ui/imagers/avatars/enum/AvatarData';
import {EntityEvents} from '../../../../engine/events/room/objects/entities/EntityEvents';

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

    /** True once the server gave a position (nextPosition is 0, 0, 0 before). */
    private hasNextPosition = false;

    /**
     * A walking entity farther than this (tiles) from its previous step jumps there before the next one (see
     * walkTo). A step takes a room cycle on the server (480 ms) and on the client (AVATAR_WALK_SPEED, 476 ms).
     */
    private static readonly MAX_WALK_LAG = 1.5;

    /**
     * How long the entity takes to walk a step (s): the server sends a step every room cycle (480 ms), the entity
     * walks it in a bit more, so it never arrives before the next step and stops waiting for it (the walk
     * stuttered at every tile when a step came a few ms late). It stays a little behind, by about a tenth of a tile.
     */
    private static readonly WALK_STEP_SECONDS = 0.52;

    /** Tiles per second of the step being walked: what's left to walk in WALK_STEP_SECONDS (see walkTo). */
    private walkSpeed = AvatarData.AVATAR_WALK_SPEED;

    /** A slide in progress (moved by a roller), null if none: see slideTo. */
    private slide: {fromX: number; fromY: number; fromZ: number; start: number; duration: number} | null = null;

    /**
     * Slides the entity to the given position in the given time, without walking (as Nitro's MovingObjectLogic for
     * the furni and the avatars moved by a roller).
     */
    slideTo(point: Point3d, duration: number): void {
        const position = this.entity.position;
        this.slide = {fromX: position.x, fromY: position.y, fromZ: position.z, start: performance.now(), duration: Math.max(1, duration)};
        this.hasNextPosition = true;

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

    /**
     * The next step of a walk, as Habbo: each step from the previous one. An entity still far from the previous
     * step (the page was hidden or paused and its frames stopped, the steps arrived in a burst, slow frames) jumps
     * there and walks only this step at the normal speed: it doesn't go after the server in jumps.
     */
    walkTo(point: Point3d): void {
        // the same step sent again (e.g. the look changed by a football gate, an effect, a hand item while walking):
        // the entity goes on walking it, it doesn't jump to its end
        const sameStep = this.hasNextPosition && point.x === this.nextPosition.x && point.y === this.nextPosition.y;

        if (!sameStep && this.hasNextPosition && this.walkLag() > EntityVisualization.MAX_WALK_LAG) {
            this.snapToNextPosition();
        }

        if (!sameStep) {
            // the rest of the previous step and the new one in a step's time: a late step is caught up smoothly
            const position = this.entity.position;
            const distance = position
                ? Math.max(Math.abs(point.x - position.x), Math.abs(point.y - position.y))
                : 1;
            this.walkSpeed = Math.max(AvatarData.AVATAR_WALK_SPEED / 2, distance / EntityVisualization.WALK_STEP_SECONDS);
        }

        this.setNextPosition(point);
    }

    /** How far (tiles) the entity is from where it's going. */
    private walkLag(): number {
        const position = this.entity.position;
        if (!position) return 0;

        return Math.max(Math.abs(this.nextPosition.x - position.x), Math.abs(this.nextPosition.y - position.y));
    }

    setNextPosition(point: Point3d) {
        // a walk or a new position from the server ends the slide
        this.slide = null;
        this.hasNextPosition = true;
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
                    delta * this.walkSpeed;
            if (this.entity.position.x > this.nextPosition.x) {
                this.entity.position.x = this.nextPosition.x;
            }
        } else if (this.entity.position.x > this.nextPosition.x) {
            this.entity.position.x = 
                this.entity.position.x -
                    delta * this.walkSpeed;
            if (this.entity.position.x < this.nextPosition.x) {
                this.entity.position.x = this.nextPosition.x;
            }
        }

        if (this.entity.position.y < this.nextPosition.y) {
            this.entity.position.y = this.entity.position.y + delta * this.walkSpeed;

            if (this.entity.position.y > this.nextPosition.y) {
                this.entity.position.y = this.nextPosition.y;
            }
        } else if (this.entity.position.y > this.nextPosition.y) {
            this.entity.position.y = this.entity.position.y - delta * this.walkSpeed;

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
        // no sortChildren here (it sorted the whole room at every frame of every entity walking): the room
        // container is sortable, a new zIndex makes Pixi sort it once before the next frame is drawn
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
