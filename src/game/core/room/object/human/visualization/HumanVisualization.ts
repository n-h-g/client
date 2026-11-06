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
import type {AvatarEffect} from '../../../../../engine/ui/imagers/avatars/effects/AvatarEffect';
import {ActionId} from '../../../../../engine/ui/imagers/avatars/enum/actions/ActionId';
import {AvatarData} from '../../../../../engine/ui/imagers/avatars/enum/AvatarData';
import {Point} from '../../../../../utils/point/Point';
import {Point3d} from '../../../../../utils/point/Point3d';
import { EventManager } from '../../../../events/EventManager';
import {Direction} from '../../../../objects/Direction';
import {EntityVisualization} from '../../entities/EntityVisualization';
import {Human} from '../Human';
import type {Item} from '../../../../../engine/room/objects/items/Item';
import { Graphics } from 'pixi.js';


export abstract class HumanVisualization extends EntityVisualization {
    entity: Human = null;
	actions: Set<ActionId>;
    danceStyle = 1;
    signValue = 1;

    protected avatar: Avatar;
    protected headDirection: Direction = Direction.SOUTH;
    protected loaded = false;

    /** The effect of the server (0: none) and, once loaded, the effect drawn with the avatar. */
    private effectId = 0;
    private effect: AvatarEffect | null = null;

    constructor(human: Human) {
        super(human);
        this.entity = human;
        this.actions = new Set();
    }

    setNextPosition(point: Point3d): void {
        super.setNextPosition(point);
    }

    async loadAvatar(): Promise<void> {
        return new Promise((resolve, reject) => {
            const avatar = new Avatar(
                this.entity.figure,
                this.direction,
                this.getAvatarHeadDirection(),
                this.actions,
                this.frame,
                0, false, false, false, this.danceStyle, this.signValue
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
        let offset = (direction - this.direction + 8) % 8;
        if (offset > 4) offset -= 8;

        // The renderer does not rotate head parts around a true neck pivot;
        // keep the head within one atlas direction of the body's facing.
        offset = Math.max(-1, Math.min(1, offset));
        this.headDirection = (this.direction + offset + 8) % 8;
    }

    private getAvatarHeadDirection(): Direction {
        // Dance effect layers already define their own head motion. Combining
        // the server look-at direction with that pose separates the atlas head.
        return this.actions.has(ActionId.DANCE) ? this.direction : this.headDirection;
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

    /**
     * The avatar effect (:effect). Its library is loaded once by the avatar imager, then the avatar
     * is drawn again with it; an effect changed meanwhile wins.
     */
    setEffect(effectId: number): void {
        const id = effectId > 0 ? effectId : 0;
        if (id === this.effectId) return;

        this.effectId = id;

        if (!id) {
            this.showEffect(null);
            return;
        }

        Engine.getInstance()?.userInterfaceManager?.avatarImager.effects.load(id).then(effect => {
            if (this.effectId === id) this.showEffect(effect);
        });
    }

    /** The effect is animated: the avatar is drawn again at every frame. */
    get hasAnimatedEffect(): boolean {
        return this.effect?.isAnimated ?? false;
    }

    private showEffect(effect: AvatarEffect | null): void {
        this.effect = effect;
        this.frame = 0;

        if (this.loaded) this.draw();
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
        if (this.container) this.container.destroy();

        if (this.loaded) {
            this.avatar = new Avatar(
                this.entity.figure,
                this.direction,
                this.getAvatarHeadDirection(),
                this.actions,
                this.frame,
                0, false, false, false, this.danceStyle, this.signValue
            );
            this.avatar.Effect = this.effect;
        } else {
            this.avatar = new AvatarPlaceHolder(
                '',
                this.direction,
                this.direction,
                this.actions,
                this.frame
            );
        }

        Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(this.avatar);
        this.updateShadowVisibility();

        this.container = this.avatar.Container;
        const avatarWidth = this.container.width > 0 ? this.container.width : 64;
        const avatarHeight = this.container.height > 0 ? this.container.height : 110;
        this.drawBlowKissHeart(avatarWidth, avatarHeight);
        const oneShotFrameCount = this.getOneShotFrameCount();
        this.needsUpdate = this.actions.has(ActionId.DANCE) ||
            this.actions.has(ActionId.WAVE) ||
            this.actions.has(ActionId.RESPECT) ||
            this.actions.has(ActionId.WALK) ||
            this.hasAnimatedEffect ||
            (oneShotFrameCount > 0 && this.frame < oneShotFrameCount - 1);

        if (Engine.getInstance().roomService?.currentRoom) {
            Engine.getInstance().roomService?.currentRoom?.roomLayout.visualization.container?.addChild(
                this.container
            );
            this.updatePosition();
        }

        this.container.pivot.set(avatarWidth / 2, avatarHeight);

        this.entity.logic.events.emit(HumanEvents.HUMAN_RENDERING_COMPLETE);

        this.container.eventMode = 'dynamic';

        this.entity.logic.registerEvents();
    }

    private drawBlowKissHeart(avatarWidth: number, avatarHeight: number): void {
        if (!this.actions.has(ActionId.BLOW) || this.frame < 3 || this.frame > 18) return;

        // Nitro treats the heart as a separate avatar addition. Draw it over
        // the avatar here so every client shows it when the Blow action is broadcast.
        const progress = (this.frame - 3) / 15;
        const heart = new Graphics();
        heart.beginFill(0xf35a9d);
        heart.drawPolygon([
            0, 5, 2, 2, 5, 1, 8, 4, 11, 1, 14, 2,
            16, 5, 15, 9, 8, 16, 1, 9,
        ]);
        heart.endFill();
        heart.beginFill(0xffb4d2, 0.9);
        heart.drawRect(4, 3, 2, 2);
        heart.endFill();
        const angle = (this.direction * 45) % 360;
        const offsetX = angle === 90 || angle === 270
            ? -3
            : angle === 135 || angle === 180 || angle === 225
                ? 22
                : -30;
        const postureOffsetY = this.actions.has(ActionId.SIT)
            ? 32
            : this.actions.has(ActionId.LAY)
                ? 64
                : 0;
        // The avatar container is pivoted at the feet, so Nitro's -70px
        // registration point maps to avatarHeight - 70 in local coordinates.
        heart.x = avatarWidth / 2 + offsetX - 8;
        heart.y = avatarHeight - 70 + postureOffsetY - 8 - progress * 24;
        heart.alpha = Math.min(1, progress * 3, (1 - progress) * 3);
        heart.zIndex = 1000;
        this.container.addChild(heart);
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
                this.updateShadowVisibility();
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
        
            if (this.container) {
                if (this.container.parent) this.container.parent.removeChild(this.container);
                this.container.destroy({ children: true });
            }

            this.loaded = true;
            this.draw(); 
        });

        this.entity.logic.events.emit(HumanEvents.HUMAN_RENDERING_COMPLETE);

        //await this.entity.logic.loadPreviewData('user');

        this.entity.logic.registerEvents();
    }

    nextFrame(): void {
        const oneShotFrameCount = this.getOneShotFrameCount();
        if (oneShotFrameCount > 0) {
            if (this.frame >= oneShotFrameCount - 1) {
                this.frame = oneShotFrameCount - 1;
                this.needsUpdate = false;
            } else {
                this.frame++;
            }
            return;
        }

        if (this.frame >= this.avatar.Frames - 1) this.frame = 0;
        else this.frame++;
    }

    private getOneShotFrameCount(): number {
        if (this.actions.has(ActionId.LAUGH)) return 16;
        if (this.actions.has(ActionId.BLOW)) return 20;
        return 0;
    }

    /** Sitting/laying on a furni (see ActionsComponent.onFurni). */
    onFurni = false;

    /**
     * As Nitro (AvatarVisualization.updateShadow) the shadow is drawn standing, walking and sitting on the floor:
     * not sitting on a furni (e.g. in a bath, where it was on the water) or laying.
     */
    private updateShadowVisibility(): void {
        const shadow = this.avatar?.ShadowContainer;
        if (!shadow) return;

        const sitsOnFurni = this.actions.has(ActionId.SIT) && this.onFurni;
        shadow.visible = !sitsOnFurni && !this.actions.has(ActionId.LAY);
    }

    updatePosition() {
        super.updatePosition();

        // the layers of the furni under the avatar (e.g. the front of a bath) are sorted around it again
        Engine.getInstance().roomService?.currentRoom?.roomEntityRepository?.refreshFrontLayers();
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
        // in the door the avatar goes under all the walls (the hat must not cover the wall over the door or the
        // walls next to it): with the priorities alone a door far from the origin (big x + y) was drawn over them
        if (isAtDoor) {
            return Engine.getInstance().roomService.currentRoom.roomLayout.visualization.getDoorZIndex();
        }

        const zIndex = RoomVisualization.calculateZIndex(
            new Point3d(
                this.entity.position.x,
                this.entity.position.y,
                this.entity.position.z + 0.001
            ),
            isAtDoor ? RoomPriority.DOOR_FLOOR_USER : RoomPriority.USER
        );

        return this.sortWithFloorItems(zIndex);
    }

    /**
     * A furni container has only one zIndex, calculated from its origin tile, so for the items bigger
     * than one tile (beds, sofas...) the zIndex of the avatar alone is not enough: next to the foot of a bed
     * the avatar has a bigger x+y than the bed origin but it's behind the bed.
     * Here the avatar is compared with the part of each floor item that is in its same screen column,
     * and its zIndex is moved below the items it's behind and above the items it's in front of.
     */
    private sortWithFloorItems(zIndex: number): number {
        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;
        if (!repository) return zIndex;

        const x = this.entity.position.x;
        const y = this.entity.position.y;
        // screen column (screen x grows with y - x) and depth (screen y grows with x + y)
        const column = y - x;
        const depth = x + y;

        let lowerBound = -Infinity;
        let upperBound = Infinity;

        for (const entity of repository.getAll().values()) {
            const item = entity as unknown as Partial<Item>;
            // structural check: importing Item/FloorItem here would create an import cycle
            if (typeof item.getFootprint !== 'function' || item.isInventoryGhost) continue;

            const footprint = item.getFootprint();
            const itemZIndex = entity.visualization?.container?.zIndex;
            if (!footprint || itemZIndex === undefined) continue;

            // the columns covered by the item; an avatar more than one column away doesn't overlap it
            const itemColumn = Math.min(
                Math.max(column, footprint.minY - footprint.maxX),
                footprint.maxY - footprint.minX
            );
            if (Math.abs(column - itemColumn) > 1) continue;

            // depth range of the item tiles in that column (tiles on the line y - x = itemColumn)
            const front = 2 * Math.min(footprint.maxX, footprint.maxY - itemColumn) + itemColumn;
            const back = 2 * Math.max(footprint.minX, footprint.minY - itemColumn) + itemColumn;

            if (depth < back) {
                upperBound = Math.min(upperBound, itemZIndex);
            } else {
                // in front of the item or on it (sitting, laying, standing on a rug...)
                lowerBound = Math.max(lowerBound, itemZIndex);
            }
        }

        if (zIndex <= lowerBound) zIndex = lowerBound + 1;
        if (zIndex >= upperBound) zIndex = upperBound - 1;

        return zIndex;
    }

    calculateOffsetX(): number {
        const tileBaseX = (this.entity.position.y * MapData.tileHeight) -
                        (this.entity.position.x * MapData.tileWidth) / 2;

        return tileBaseX + (MapData.tileWidth / 2) + this.getPostureOffset().x;
    }

    calculateOffsetY(): number {

        const tileBaseY = (this.entity.position.y * MapData.tileHeight) / 2 +
                        (this.entity.position.x * MapData.tileWidth) / 4 -
                        (this.entity.position.z * MapData.thickSpace * MapData.stairSteps);

        return tileBaseY + (MapData.tileHeight / 2) + AvatarData.AVATAR_TOP_OFFSET + 2 + this.getPostureOffset().y;
    }

    /**
     * The avatar stands up from a seat to walk. The server puts a sitting avatar on top of the seat and
     * a walking one at the base of it (as Habbo); the sitting avatar is drawn AVATAR_SIT_OFFSET lower than
     * its Z, so without this it would pop up when the sitting posture is removed and then go down.
     * It starts from the Z where it was drawn: at most one sit offset lower, never under the next Z.
     *
     * @param nextZ the Z of the tile it walks to.
     */
    standUpFromSeat(nextZ: number): void {
        const sitOffsetZ = AvatarData.AVATAR_SIT_OFFSET / (MapData.thickSpace * MapData.stairSteps);
        const drop = Math.min(sitOffsetZ, Math.max(0, this.entity.position.z - nextZ));

        this.entity.position.z -= drop;
    }

    /**
     * Offset of the avatar canvas that depends on the posture geometry.
     * Only laying uses a different canvas ("horizontal") from standing/sitting ("vertical"/"sitting").
     *
     * @see AvatarData.AVATAR_LAY_OFFSET_X
     */
    private getPostureOffset(): Point {
        if (this.actions?.has(ActionId.SIT)) return new Point(0, AvatarData.AVATAR_SIT_OFFSET);
        if (!this.actions?.has(ActionId.LAY)) return new Point(0, 0);

        // the laying sprites exist only for direction 2 and its mirror 4 (see AvatarSpriteComponent)
        const isMirrored = this.direction > 3 && this.direction < 7;

        return new Point(
            isMirrored ? AvatarData.AVATAR_LAY_OFFSET_X_FLIPPED : AvatarData.AVATAR_LAY_OFFSET_X,
            isMirrored ? AvatarData.AVATAR_LAY_OFFSET_Y_FLIPPED : AvatarData.AVATAR_LAY_OFFSET_Y
        );
    }
}
