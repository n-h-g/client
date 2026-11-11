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
import {FloatingIdleZAddition} from './additions/FloatingIdleZAddition';
import {TypingBubbleAddition} from './additions/TypingBubbleAddition';
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
    public entity: Human = null;
	protected actions: Set<ActionId>;
    protected danceStyle = 1;
    protected signValue = 1;

    protected avatar: Avatar;
    protected headDirection: Direction = Direction.SOUTH;
    protected loaded = false;

    /** The user is typing a chat message: the bubble over its head. */
    private typing = false;
    private readonly typingBubble = new TypingBubbleAddition();
    /** The avatar is idle (the Sleep action of the server): the zzz next to its head. */
    private readonly idleZ = new FloatingIdleZAddition();

    /** The effect of the server (0: none) and, once loaded, the effect drawn with the avatar. */
    private effectId = 0;
    private effect: AvatarEffect | null = null;

    /** The hand item of the server (0: nothing) and if the avatar is drinking it now (see HumanLogic). */
    private handItem = 0;
    private usingHandItem = false;

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
                0, false, false, false, this.danceStyle, this.signValue, this.onFurni
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
        window.clearTimeout(this.gestureTimer);
        this.idleZ.remove();
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

    get HandItem(): number {
        return this.handItem;
    }

    /** What the avatar carries in its hand (e.g. a coffee of a vending machine), 0 for nothing. */
    setHandItem(id: number): void {
        const item = id > 0 ? id : 0;
        if (item === this.handItem) return;

        this.handItem = item;
        this.usingHandItem = false;
        if (this.loaded) this.draw();
    }

    /** The avatar drinks/eats what it carries for an instant (see HumanLogic), as in Habbo. */
    setUsingHandItem(using: boolean): void {
        if (this.usingHandItem === using) return;

        this.usingHandItem = using;
        if (this.loaded) this.draw();
    }

    /**
     * The expression of the last chat message (e.g. :) smiles, see ChatGestures), null without: shown for a while
     * on the client only, as Nitro's gestures. It doesn't change the actions of the server.
     */
    private gesture: ActionId | null = null;
    private gestureTimer: number | undefined;

    showGesture(gesture: ActionId, duration: number): void {
        window.clearTimeout(this.gestureTimer);

        this.gesture = gesture;
        this.frame = 0;
        this.gestureTimer = window.setTimeout(() => {
            this.gesture = null;
            this.frame = 0;
            if (this.loaded) this.draw();
        }, duration);

        if (this.loaded) this.draw();
    }

    /** Until when the avatar talks (its mouth moves): the time of performance.now(), 0 if it doesn't. */
    private talkingUntil = 0;
    private talkTimer: number | undefined;

    /**
     * The avatar said something: its mouth moves for a while, as Nitro (a second every 10 characters of the
     * message, RoomUnitChatHandler / AvatarLogic). With the other actions and the expressions.
     */
    startTalking(text: string): void {
        const duration = Math.max(1, Math.ceil((text?.length ?? 0) / 10)) * 1000;

        this.talkingUntil = performance.now() + duration;
        // drawn again by the game loop (HumanLogic), not now: the chat places the bubble on the avatar
        this.needsUpdate = true;

        // the mouth closed at the end
        window.clearTimeout(this.talkTimer);
        this.talkTimer = window.setTimeout(() => {
            this.talkingUntil = 0;
            if (this.loaded) this.draw();
        }, duration);
    }

    private isTalking(): boolean {
        return this.talkingUntil > performance.now();
    }

    /** True if the avatar has the action, of the server or as the expression of its chat. */
    private hasDrawAction(action: ActionId): boolean {
        return this.actions.has(action) || this.gesture === action;
    }

    /** The eyes are closed for an instant (see HumanLogic): the avatar blinks, as in Habbo. */
    private blinking = false;

    /** The actions that use the eyes: the avatar doesn't blink with them (Nitro: they prevent Sleep). */
    private static readonly EYE_ACTIONS = [ActionId.SLEEP, ActionId.TALK, ActionId.LAUGH, ActionId.BLOW];

    /** Opens/closes the eyes: the avatar is drawn again. */
    setBlink(blinking: boolean): void {
        if (this.blinking === blinking) return;

        this.blinking = blinking;
        if (this.loaded) this.draw();
    }

    /**
     * The actions the avatar is drawn with: the ones of the server, plus Sleep (eyes closed, as Nitro's blink)
     * while it blinks. The actions of the server are not changed.
     */
    private getDrawActions(): Set<ActionId> {
        // the expression first: the imager gives each part the first action that has it, and Default has the
        // eyes and the face too (Nitro sorts by precedence: the gestures 510 before Default 1000)
        let actions = this.gesture ? new Set([this.gesture, ...this.actions]) : this.actions;
        // talking: the mouth. First, as the expressions: the imager gives each part the first action that has it
        // (Talk has the precedence 500, before the expressions 510 and Default 1000)
        if (this.isTalking()) actions = new Set([ActionId.TALK, ...actions]);

        // the expressions use the eyes: no blink
        if (!this.blinking || this.gesture || HumanVisualization.EYE_ACTIONS.some(action => actions.has(action))) return actions;

        return new Set([ActionId.SLEEP, ...actions]);
    }

    /** The user started/stopped typing (or sent its message): the bubble over its head. */
    setTyping(typing: boolean): void {
        if (this.typing === typing) return;

        this.typing = typing;
        this.updateTypingBubble();
    }

    private updateTypingBubble(): void {
        this.typingBubble.update(this.container, this.typing && this.loaded, HumanVisualization.AVATAR_CANVAS_WIDTH, this.getTypingBubbleOffset());
    }

    private updateIdleZ(): void {
        this.idleZ.update(
            this.container,
            this.loaded && !!this.actions?.has(ActionId.SLEEP),
            HumanVisualization.AVATAR_CANVAS_WIDTH,
            this.direction,
            this.getTypingBubbleOffset()
        );
    }

    /**
     * Where the bubble goes from its standing place, in the avatar container (that already follows the posture).
     * Sitting the head is where it is standing: the bubble doesn't move. Laying, Nitro moves the bubble down by a
     * whole avatar (64) and the avatar by half (32): the bubble goes down by the rest.
     */
    private getTypingBubbleOffset(): {x: number; y: number} {
        if (this.actions?.has(ActionId.LAY)) return {x: 0, y: 32};

        return {x: 0, y: 0};
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
                this.getDrawActions(),
                this.frame,
                0, false, false, false, this.danceStyle, this.signValue, this.onFurni
            );
            this.avatar.Effect = this.effect;
            this.avatar.HandItem = this.handItem;
            this.avatar.UsingHandItem = this.usingHandItem;
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
        const {width: avatarWidth, height: avatarHeight} = this.getAvatarSize();
        this.drawBlowKissHeart(avatarWidth, avatarHeight);
        this.updateTypingBubble();
        this.updateIdleZ();
        const oneShotFrameCount = this.getOneShotFrameCount();
        this.needsUpdate = this.actions.has(ActionId.DANCE) ||
            this.gesture === ActionId.LAUGH ||
            this.actions.has(ActionId.WAVE) ||
            this.actions.has(ActionId.RESPECT) ||
            this.actions.has(ActionId.WALK) ||
            this.hasAnimatedEffect ||
            this.isTalking() ||
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

    /**
     * The size the avatar container is anchored with (pivot at the middle of its feet). The parts are drawn
     * asynchronously: an avatar still empty uses the size of the avatar canvas.
     */
    private getAvatarSize(): {width: number; height: number} {
        return {
            width: this.container && this.container.width > 0 ? this.container.width : HumanVisualization.AVATAR_CANVAS_WIDTH,
            height: this.container && this.container.height > 0 ? this.container.height : HumanVisualization.AVATAR_CANVAS_HEIGHT,
        };
    }

    /** The avatar canvas (HabboAvatarGeometry "vertical", large). */
    private static readonly AVATAR_CANVAS_WIDTH = 64;
    private static readonly AVATAR_CANVAS_HEIGHT = 110;

    private drawBlowKissHeart(avatarWidth: number, avatarHeight: number): void {
        if (!this.actions.has(ActionId.BLOW) || this.frame < 3 || this.frame > 18) return;

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
        heart.x = avatarWidth / 2 + offsetX - 8;
        heart.y = avatarHeight - 140 + postureOffsetY - 8 - progress * 24;
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
        // the placeholder is drawn when its parts are loaded: anchored as the avatar (see draw), not at 0, 0,
        // or its shadow appeared for an instant out of the tile of the user
        const {width, height} = this.getAvatarSize();
        this.container.pivot.set(width / 2, height);

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
        if (this.hasDrawAction(ActionId.LAUGH)) return 16;
        if (this.actions.has(ActionId.BLOW)) return 20;
        return 0;
    }

    /** Sitting/laying on a furni (see ActionsComponent.onFurni). */
    onFurni = false;

    /**
     * The shadow is drawn only standing and walking: not sitting (on a furni or on the floor) or laying.
     * It doesn't depend on onFurni: e.g. the avatars already sitting when the user enters the room don't have it.
     */
    private updateShadowVisibility(): void {
        const shadow = this.avatar?.ShadowContainer;
        if (!shadow) return;

        shadow.visible = !this.actions.has(ActionId.SIT) && !this.actions.has(ActionId.LAY);
    }

    updatePosition() {
        super.updatePosition();

        // the layers of the furni under the avatar (e.g. the front of a bath) are sorted around it again
        Engine.getInstance().roomService?.currentRoom?.roomEntityRepository?.refreshFrontLayers();
    }

    getZIndex(): number {
        // in the door from when it passes half of the step: there it crosses the line of the wall.
        // (with Math.floor it was in the door only on arrival when the coordinates grow, or walking
        // diagonally, and the avatar walking to the door was drawn over the wall for a whole step)
        const door = Engine.getInstance().roomService.currentRoom.roomLayout.getDoorPosition();
        const isAtDoor =
            Math.abs(this.entity.position.x - door.x) < 0.5 &&
            Math.abs(this.entity.position.y - door.y) < 0.5;
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

        return HumanVisualization.sortWithFloorItems(this.entity.position.x, this.entity.position.y, zIndex);
    }

    /**
     * A furni container has only one zIndex, calculated from its origin tile, so for the items bigger
     * than one tile (beds, sofas...) the zIndex of the avatar alone is not enough: next to the foot of a bed
     * the avatar has a bigger x+y than the bed origin but it's behind the bed.
     * Here the avatar is compared with the part of each floor item that is in its same screen column,
     * and its zIndex is moved below the items it's behind and above the items it's in front of.
     */
    /** Items up to this height (rugs, floor tiles) are flat: they don't cover the avatars behind them. */
    private static readonly FLAT_ITEM_HEIGHT = 0.1;

    /** Also for the pets (PetEntityVisualization): they stand on the tiles as the avatars. */
    static sortWithFloorItems(x: number, y: number, zIndex: number): number {
        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;
        if (!repository) return zIndex;

        // screen column (screen x grows with y - x) and depth (screen y grows with x + y)
        const column = y - x;
        const depth = x + y;

        // the tile of the avatar: the items covering it are the ones it's on
        const tileX = Math.round(x);
        const tileY = Math.round(y);

        let lowerBound = -Infinity;
        let upperBound = Infinity;
        let onBound = -Infinity;

        for (const entity of repository.getAll().values()) {
            const item = entity as unknown as Partial<Item>;
            // structural check: importing Item/FloorItem here would create an import cycle
            if (typeof item.getFootprint !== 'function' || item.isInventoryGhost) continue;

            const footprint = item.getFootprint();
            const itemZIndex = entity.visualization?.container?.zIndex;
            if (!footprint || itemZIndex === undefined) continue;

            // on the item (sitting on the sofa, laying on the bed, in the bath, on a rug): always over it
            if (tileX >= footprint.minX && tileX <= footprint.maxX && tileY >= footprint.minY && tileY <= footprint.maxY) {
                onBound = Math.max(onBound, itemZIndex);
                continue;
            }

            // the columns covered by the item; an avatar more than one column away doesn't overlap it
            const itemColumn = Math.min(
                Math.max(column, footprint.minY - footprint.maxX),
                footprint.maxY - footprint.minX
            );
            if (Math.abs(column - itemColumn) > 1) continue;

            // depth range of the item tiles in that column (tiles on the line y - x = itemColumn)
            const back = 2 * Math.max(footprint.minX, footprint.minY - itemColumn) + itemColumn;

            if (depth < back) {
                // a flat item (a rug) can't cover the avatar behind it: e.g. a rug in front of a sofa
                // put the avatar sitting on the sofa under the sofa (same zIndex of the rug)
                if ((item.getStackHeight?.() ?? 0) > HumanVisualization.FLAT_ITEM_HEIGHT) {
                    upperBound = Math.min(upperBound, itemZIndex);
                }
            } else {
                // in front of the item
                lowerBound = Math.max(lowerBound, itemZIndex);
            }
        }

        if (zIndex <= lowerBound) zIndex = lowerBound + 1;
        if (zIndex >= upperBound) zIndex = upperBound - 1;
        // the item the avatar is on wins over the others: the avatar is never drawn under its seat. Over the seat
        // but under the item in front of it when there is room between them (the chair at the side of a table,
        // see ItemVisualization.getZIndex): the zIndexes of the items can be one apart
        if (zIndex <= onBound) zIndex = onBound < upperBound ? onBound + Math.min(1, (upperBound - onBound) / 2) : onBound + 1;

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
     * The avatar stands up from a seat or a bed to walk. As Nitro: a sitting/laying avatar is at the base of the
     * furni plus its height (RoomMessageHandler: status.z + sit/lay height); when it stands up the status has
     * the base only, so the avatar goes at once to the base of the furni and walks from there.
     * Without this it started from the top of the bed (or of the seat) and went down along the step,
     * as on a stair.
     *
     * @param nextZ the Z of the tile it walks to: where it goes if there is no furni under it.
     */
    standUp(nextZ: number): void {
        const {x, y, z} = this.entity.position;
        const base = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository?.getRestingItemZ(x, y, z);
        // never under the tile it walks to (e.g. the furni saved with Z 0 before the heights, that is the floor)
        const target = Math.max(base ?? nextZ, nextZ);

        if (z > target) this.entity.position.z = target;
    }

    /**
     * Offset of the avatar canvas that depends on the posture geometry.
     * Only laying uses a different canvas ("horizontal") from standing/sitting ("vertical"/"sitting").
     *
     * @see AvatarData.AVATAR_LAY_OFFSET_X
     */
    private getPostureOffset(): Point {
        if (this.actions?.has(ActionId.SIT)) {
            const sitOffset = this.onFurni
                ? AvatarData.AVATAR_SIT_OFFSET
                : AvatarData.AVATAR_SIT_FLOOR_OFFSET;
            return new Point(0, sitOffset);
        }
        if (!this.actions?.has(ActionId.LAY)) return new Point(0, 0);

        // the laying sprites exist only for direction 2 and its mirror 4 (see AvatarSpriteComponent)
        const isMirrored = this.direction > 3 && this.direction < 7;

        return new Point(
            isMirrored ? AvatarData.AVATAR_LAY_OFFSET_X_FLIPPED : AvatarData.AVATAR_LAY_OFFSET_X,
            isMirrored ? AvatarData.AVATAR_LAY_OFFSET_Y_FLIPPED : AvatarData.AVATAR_LAY_OFFSET_Y
        );
    }
}
