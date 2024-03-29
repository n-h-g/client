import {Engine} from '../../../../../Engine';
import {HumanEvents} from '../../../../../engine/events/room/objects/entities/HumanEvents';
import {MapData} from '../../../../../engine/room/objects/map/MapData';
import {Tile} from '../../../../../engine/room/objects/map/Tile';
import {RoomPriority} from '../../../../../engine/room/visualization/RoomPriority';
import {RoomVisualization} from '../../../../../engine/room/visualization/RoomVisualization';
import {Avatar} from '../../../../../engine/ui/imagers/avatars/Avatar';
import {AvatarPlaceHolder} from '../../../../../engine/ui/imagers/avatars/AvatarPlaceholder';
import {ActionId} from '../../../../../engine/ui/imagers/avatars/enum/actions/ActionId';
import {AvatarData} from '../../../../../engine/ui/imagers/avatars/enum/AvatarData';
import {Point} from '../../../../../utils/point/Point';
import {Point3d} from '../../../../../utils/point/Point3d';
import {Rotation} from '../../../../../utils/Rotation';
import {Direction} from '../../../../objects/Direction';
import {EntityVisualization} from '../../entities/EntityVisualization';
import {Human} from '../Human';


export abstract class HumanVisualization extends EntityVisualization {
    entity: Human = null;
	actions: Set<ActionId>;

    protected avatar: Avatar;
    protected headDirection: Direction = Direction.SOUTH;
    protected loaded = false;

    constructor(human: Human) {
        super(human);
        this.entity = human;
        this.actions = new Set();
    }

    setNextPosition(point: Point3d): void {
        super.setNextPosition(point);
        this.headRotation = Rotation.calculateDirection(
            new Point(
                this.entity.position.x,
                this.entity.position.y
            ),
            new Point(this.entity.position.x, this.entity.position.y)
        );
    }

    async loadAvatar(): Promise<void> {
        return new Promise((resolve, reject) => {
            const avatar = new Avatar(
                this.entity.figure,
                this.direction,
                this.direction,
                this.actions,
                this.frame
            );

            Engine.getInstance()
                ?.userInterfaceManager?.avatarImager.loadAvatar(avatar)
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });
    }

    dispose(): void {
        super.dispose();
    }

    set headRotation(direction: Direction) {
        this.headDirection = direction;
    }

    addAction(action: ActionId): void {
        this.removeActions([
            ActionId.STAND,
            ActionId.WALK,
            ActionId.SIT,
            ActionId.LAY,
        ]);
        this.actions.add(action);
    }

    removeAction(action: ActionId): void {
        this.actions.delete(action);
    }
    removeActions(actions: ActionId[]) {
        for (const action of actions) this.removeAction(action);
    }

    updateDirection(direction: Direction) {
        const avatar = this.avatar;
        this.container!.removeChildren();
        avatar!.Direction = direction;
    }

    async draw(): Promise<void> {
        this.container.destroy();

        if (this.loaded) {
            this.avatar = new Avatar(
                this.entity.figure,
                this.direction,
                this.direction,
                this.actions,
                this.frame
            );
        } else {
            this.avatar = new AvatarPlaceHolder(
                '',
                this.direction,
                this.direction,
                this.actions,
                this.frame
            );
        }

        Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(
            this.avatar
        );

        this.container = this.avatar.Container;

        if (Engine.getInstance().roomService?.currentRoom) {
            Engine.getInstance().roomService?.currentRoom?.roomLayout.visualization.container?.addChild(
                this.container
            );
            this.updatePosition();
        }

        this.entity.logic.events.emit(HumanEvents.HUMAN_RENDERING_COMPLETE);

        this.container.eventMode = 'dynamic';

        this.entity.logic.registerEvents();
    }

    async render(): Promise<void> {
        const placeholder = new AvatarPlaceHolder(
            '',
            this.direction,
            this.direction,
            this.actions,
            this.direction,
            this.frame
        );

        this.avatar = placeholder;

        Engine.getInstance()
            ?.userInterfaceManager?.avatarImager.loadAvatar(placeholder)
            .then(() => {
                Engine.getInstance()?.userInterfaceManager?.avatarImager.drawAvatar(
                    placeholder
                );
            });

        placeholder.Container.cursor = 'pointer';
        placeholder.Container.eventMode = 'dynamic';
        placeholder.Container.interactiveChildren = true;

        this.container = this.avatar.Container;

        this.container.zIndex = this.getZIndex();

        this.loadAvatar().then(() => {
            this.container.destroy();
            this.loaded = true;
            this.draw();
        });

        if (Engine.getInstance().roomService?.currentRoom) {
            Engine.getInstance().roomService?.currentRoom?.roomLayout.visualization.container?.addChild(
                this.container
            );
            this.updatePosition();
        }

        this.entity.logic.events.emit(HumanEvents.HUMAN_RENDERING_COMPLETE);

        this.entity.logic.registerEvents();
    }

    nextFrame(): void {
        if (this.frame > this.avatar.Frames) this.frame = 0;
        else this.frame++;
    }

    getZIndex(): number {
        const isAtDoor =
            Math.floor(this.entity.position.x) ==
                Engine.getInstance()
                    .roomService.currentRoom.roomLayout.getDoorPosition()
                    .x &&
            Math.floor(this.entity.position.y) ==
                Engine.getInstance()
                    .roomService.currentRoom.roomLayout.getDoorPosition()
                    .y;
        return RoomVisualization.calculateZIndex(
            new Point3d(
                this.entity.position.x,
                this.entity.position.y,
                this.entity.position.z + 0.001
            ),
            isAtDoor ? RoomPriority.DOOR_FLOOR_USER : RoomPriority.USER
        );
    }

    calculateOffsetY(): number {
        const tile: Tile = Engine.getInstance()
            .roomService.currentRoom.roomLayout.getFloorPlane()
            .getTilebyPosition(
                new Point(
                    Math.round(this.entity.position.x),
                    Math.round(this.entity.position.y)
                )
            );
        const offsetFloor =
            tile!.position.z > 0
                ? -MapData.thickSpace *
                  MapData.stepHeight *
                  tile!.position.z
                : -AvatarData.AVATAR_TOP_OFFSET;
        return (this.container!.y =
            ((this.entity.position.x + this.entity.position.y) *
                MapData.tileHeight) /
                2 +
            MapData.tileHeight / 2 +
            offsetFloor);
    }

    calculateOffsetX(): number {
        return (
            ((this.entity.position.y - this.entity.position.x) *
                MapData.tileWidth) /
                2 +
            MapData.tileWidth / 2 -
            MapData.tileWidth / 2
        );
    }
}
