import {Engine} from '../../../../../Engine';
import {HumanEvents} from '../../../../../engine/events/room/objects/entities/HumanEvents';
import { ChangeLookEventData } from '../../../../../engine/events/ui/data/avatar/ChangeLookEventData';
import { UIEvents } from '../../../../../engine/events/ui/UIEvents';
import { UIEventsType } from '../../../../../engine/events/ui/UIEventsType';
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
import { EventManager } from '../../../../events/EventManager';
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

        const avatarWidth = this.container.width > 0 ? this.container.width : 64;
        const avatarHeight = this.container.height > 0 ? this.container.height : 110;

        this.container.pivot.set(avatarWidth / 2, avatarHeight);

        this.entity.logic.events.emit(HumanEvents.HUMAN_RENDERING_COMPLETE);

        this.container.eventMode = 'dynamic';

        this.entity.logic.registerEvents();
    }

    async render(): Promise<void> {

        if (this.container) {
            if (this.container.parent) {
                this.container.parent.removeChild(this.container);
            }
            this.container.destroy({ children: true });
        }

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
                Engine.getInstance()?.userInterfaceManager?.avatarImager.drawAvatar(placeholder);
            });

        this.container = this.avatar.Container;
        this.container.zIndex = this.getZIndex();
        this.container.cursor = 'pointer';
        this.container.eventMode = 'dynamic';
        this.container.interactiveChildren = true;
         this.container.pivot.set(this.container.width / 2, this.container.height);

        if (Engine.getInstance().roomService?.currentRoom) {
            Engine.getInstance().roomService?.currentRoom?.roomLayout.visualization.container?.addChild(
                this.container
            );
            this.updatePosition();
        }

        this.loadAvatar().then(() => {
        
            if (this.container && this.container.parent) {
                this.container.parent.removeChild(this.container);
            }
            this.container.destroy({ children: true });

            this.loaded = true;
            this.draw(); 
        });

        this.entity.logic.events.emit(HumanEvents.HUMAN_RENDERING_COMPLETE);

        //await this.entity.logic.loadPreviewData('user');

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

    calculateOffsetX(): number {
        const tileBaseX = (this.entity.position.y * MapData.tileHeight) - 
                        (this.entity.position.x * MapData.tileWidth) / 2;

        return tileBaseX + (MapData.tileWidth / 2);
    }

    calculateOffsetY(): number {

        const tileBaseY = (this.entity.position.y * MapData.tileHeight) / 2 + 
                        (this.entity.position.x * MapData.tileWidth) / 4 -
                        (this.entity.position.z * MapData.thickSpace * MapData.stairSteps);

        return tileBaseY + (MapData.tileHeight / 2) + AvatarData.AVATAR_TOP_OFFSET + 2;
    }
}
