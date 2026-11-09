import {Container, Sprite} from 'pixi.js';
import {FurniSpriteUtils} from '../items/utils/FurniSpriteUtils';
import {PetFigureData} from './PetFigureData';
import {PetLayerTag, PetLibrary} from './PetLibrary';
import {
    isTransitionAnimation,
    PetFrame,
    transitionFromAnimationId,
    transitionToAnimationId,
} from './PetAnimationData';

/** An animation playing: the posture or the gesture (Nitro's AnimationStateData). */
class AnimationState {
    animationId = -1;
    /** The animation after the transition that is playing now. */
    afterTransition = -1;
    counter = 0;
    /** The frames of the random layers, kept until they end. */
    readonly randomFrames = new Map<number, PetFrame>();

    set(animationId: number, counter: number): void {
        this.animationId = animationId;
        this.counter = counter;
        this.randomFrames.clear();
    }
}

/**
 * A pet drawn from its library, as Nitro's PetVisualization: the layers (body, head, tail...) of the posture
 * (std, sit, lay...) and of the gesture (the expressions: sml, sad...) at the same time. For each layer the gesture
 * wins when it animates that layer, and the offsets of both add up. The head can look somewhere else than the body.
 *
 * The container has its origin on the point of the tile where the pet stands (as the furni): the sprites are placed
 * with the offsets of the assets.
 */
export class Pet {
    /** Nitro's animated visualizations: 24 frames a second. */
    static readonly FPS = 24;
    /** Nitro's shadow: 48 / 255. */
    private static readonly SHADOW_ALPHA = 48 / 255;
    private static readonly POSTURE = 0;
    private static readonly GESTURE = 1;

    readonly container = new Container();
    readonly library: PetLibrary;

    private figure: PetFigureData;
    private direction = 2;
    /** -1: the head looks where the body looks. */
    private headDirection = -1;
    private posture: string | null = null;
    private gesture: string | null = null;
    private riding = false;
    private shadow = true;

    private readonly states = [new AnimationState(), new AnimationState()];
    private readonly sprites = new Map<number, Sprite>();
    private shadowSprite: Sprite | null = null;
    private elapsed = 0;
    private destroyed = false;

    constructor(library: PetLibrary, figure: PetFigureData) {
        this.library = library;
        this.figure = figure;
        this.container.sortableChildren = true;

        // the default posture of the library (std for most of them), with its animation
        this.posture = library.defaultPostureName;
        this.setAnimation(Pet.POSTURE, library.postureToAnimation(this.posture));
        this.draw();
    }

    // #region state

    get Figure(): PetFigureData {
        return this.figure;
    }

    get Direction(): number {
        return this.direction;
    }

    get Posture(): string | null {
        return this.posture;
    }

    get Gesture(): string | null {
        return this.gesture;
    }

    setFigure(figure: PetFigureData): void {
        this.figure = figure;
        this.draw();
    }

    /** The direction of the body (0..7, as the avatars): the head turns with it unless it has its own. */
    setDirection(direction: number): void {
        if (direction === this.direction) return;

        this.direction = direction;
        // as Nitro (updateAnimation): with a new direction the random frames are chosen again
        for (const state of this.states) state.randomFrames.clear();
        this.draw();
    }

    /** Where the head looks (e.g. at who is talking), -1 with the body. */
    setHeadDirection(direction: number): void {
        if (direction === this.headDirection) return;

        this.headDirection = direction;
        this.draw();
    }

    /** The posture (std, mv, sit, lay...): the default one if the library hasn't it. */
    setPosture(posture: string | null): void {
        if (posture === this.posture) return;

        this.posture = posture;
        this.setAnimation(Pet.POSTURE, this.library.postureToAnimation(posture));

        // e.g. dead: no expressions
        if (this.library.gestureToAnimation(this.gesture, posture) < 0) this.setAnimation(Pet.GESTURE, -1);
        this.draw();
    }

    /** The expression (sml, sad, joy...), null for none. */
    setGesture(gesture: string | null): void {
        if (gesture === this.gesture) return;

        this.gesture = gesture;
        this.setAnimation(Pet.GESTURE, this.library.gestureToAnimation(gesture, this.posture));
        this.draw();
    }

    /** Someone rides it: the saddle layers are not drawn (the avatar is on it). */
    setRiding(riding: boolean): void {
        if (riding === this.riding) return;

        this.riding = riding;
        this.draw();
    }

    setShadow(shadow: boolean): void {
        if (shadow === this.shadow) return;

        this.shadow = shadow;
        this.draw();
    }

    /**
     * Nitro's FurnitureAnimatedVisualization.setSubAnimation: between two animations it plays the transition from
     * the first one or the one to the second one, if the library has it (e.g. the horse lying down).
     */
    private setAnimation(index: number, animationId: number): void {
        const state = this.states[index];
        const current = isTransitionAnimation(state.animationId) ? state.afterTransition : state.animationId;
        if (animationId === current) return;

        let next = animationId;
        const target = this.library.getAnimation(animationId);

        if (state.animationId >= 0 && animationId >= 0 && !target?.isImmediateChangeFrom(current)) {
            const from = transitionFromAnimationId(current);
            const to = transitionToAnimationId(animationId);

            if (this.library.hasAnimation(from)) next = from;
            else if (this.library.hasAnimation(to)) next = to;
        }

        state.afterTransition = next === animationId ? -1 : animationId;
        state.set(next, this.library.getAnimation(next)?.getStartCounter() ?? 0);
    }

    // #endregion

    // #region animation

    /** Moves the animations on by the time passed (ms), drawn again if a frame changed. */
    update(deltaMs: number): void {
        if (this.destroyed) return;

        this.elapsed += deltaMs;
        const ticks = Math.floor(this.elapsed / (1000 / Pet.FPS));
        if (ticks < 1) return;

        this.elapsed -= ticks * (1000 / Pet.FPS);
        this.advance(ticks);
    }

    /** Moves the animations on by some frames (at Pet.FPS). */
    advance(ticks = 1): void {
        if (this.destroyed || !this.isAnimating) return;

        for (const state of this.states) {
            if (state.animationId < 0) continue;

            state.counter += ticks;

            // a transition over: the animation after it
            const animation = this.library.getAnimation(state.animationId);
            if (isTransitionAnimation(state.animationId) && (!animation || animation.isOver(state.counter))) {
                const after = state.afterTransition;
                state.afterTransition = -1;
                state.set(after, this.library.getAnimation(after)?.getStartCounter() ?? 0);
            }
        }

        this.draw();
    }

    /** False when all the animations stay still (e.g. a pet standing): nothing to update. */
    get isAnimating(): boolean {
        return this.states.some(state => {
            if (state.animationId < 0) return false;

            const animation = this.library.getAnimation(state.animationId);
            return !!animation && !animation.isOver(state.counter);
        });
    }

    /** The frame of a layer: the one of the gesture if it animates the layer, else the posture's (Nitro). */
    private frameOf(layerId: number, direction: number): {id: number; x: number; y: number} {
        let id: number | null = null;
        let x = 0;
        let y = 0;

        for (let index = this.states.length - 1; index >= 0; index--) {
            const frame = this.stateFrame(this.states[index], layerId, direction);
            if (!frame) continue;

            id ??= frame.id;
            x += frame.x;
            y += frame.y;
        }

        return {id: id ?? 0, x, y};
    }

    private stateFrame(state: AnimationState, layerId: number, direction: number): PetFrame | null {
        if (state.animationId < 0) return null;

        const layer = this.library.getAnimation(state.animationId)?.getLayer(layerId);
        if (!layer) return null;

        if (!layer.isRandom) return layer.getFrame(direction, state.counter);

        let frame = state.randomFrames.get(layerId);
        if (!frame || state.counter >= frame.until) {
            frame = layer.getFrame(direction, state.counter) ?? undefined;
            if (frame) state.randomFrames.set(layerId, frame);
            else state.randomFrames.delete(layerId);
        }
        return frame ?? null;
    }

    // #endregion

    // #region drawing

    private isHeadLayer(layerId: number): boolean {
        const tag = this.library.getLayerTag(layerId);
        return tag === PetLayerTag.HEAD || tag === PetLayerTag.HAIR;
    }

    /** Head only: the layers with a tag that is not the head (body, tail...) are not drawn. */
    private isHiddenLayer(layerId: number): boolean {
        const tag = this.library.getLayerTag(layerId);

        if (this.figure.headOnly && tag && !this.isHeadLayer(layerId)) return true;
        if (this.riding && tag === PetLayerTag.SADDLE) return true;

        return false;
    }

    private layerDirection(layerId: number): number {
        const direction = this.isHeadLayer(layerId) && this.headDirection >= 0 ? this.headDirection : this.direction;
        return this.library.getValidDirection(direction);
    }

    /** Draws the layers of the frame of now. */
    draw(): void {
        if (this.destroyed) return;

        for (let layerId = 0; layerId < this.library.layerCount; layerId++) this.drawLayer(layerId);
        this.drawShadow();
    }

    private drawLayer(layerId: number): void {
        const sprite = this.sprites.get(layerId);

        if (this.isHiddenLayer(layerId)) {
            if (sprite) sprite.visible = false;
            return;
        }

        const direction = this.layerDirection(layerId);
        const frame = this.frameOf(layerId, direction);
        let name = this.library.layerAssetName(layerId, direction, frame.id);

        // a custom part (e.g. the hair of a horse) is <asset>_<part>, with its palette
        let palette = String(this.figure.paletteId);
        const part = this.figure.getCustomPart(layerId);
        if (name && part) {
            if (part.partId > -1) name = `${name}_${part.partId}`;
            if (part.paletteId > -1) palette = String(part.paletteId);
        }

        const asset = name ? this.library.getAsset(name, palette) : null;
        if (!asset) {
            if (sprite) sprite.visible = false;
            return;
        }

        const target = sprite ?? this.createSprite(layerId);
        target.texture = asset.texture;
        target.visible = true;
        target.scale.x = asset.flipH ? -1 : 1;
        target.pivot.set(asset.x, asset.y);
        target.position.set(frame.x, frame.y);
        target.tint = this.figure.color;
        target.alpha = this.library.getLayerAlpha(layerId);

        const ink = this.library.getLayerInk(layerId);
        if (ink) target.blendMode = FurniSpriteUtils.getBlendModeFromInk(ink);

        // as Nitro (relativeDepth = -z / 1000 - layer * 0.001): the higher z, then the next layer, is drawn over
        target.zIndex = this.library.getLayerZ(direction, layerId) + layerId;
    }

    private createSprite(layerId: number): Sprite {
        const sprite = new Sprite();
        if (this.library.getLayerIgnoreMouse(layerId)) sprite.eventMode = 'none';

        this.sprites.set(layerId, sprite);
        this.container.addChild(sprite);
        return sprite;
    }

    private drawShadow(): void {
        const asset = this.shadow && !this.figure.headOnly
            ? this.library.getAsset(this.library.shadowAssetName(this.library.getValidDirection(this.direction)), String(this.figure.paletteId))
            : null;

        if (!asset) {
            if (this.shadowSprite) this.shadowSprite.visible = false;
            return;
        }

        if (!this.shadowSprite) {
            this.shadowSprite = new Sprite();
            // the shadow is not part of the pet for the mouse
            this.shadowSprite.eventMode = 'none';
            this.shadowSprite.zIndex = -1_000_000;
            this.container.addChild(this.shadowSprite);
        }

        this.shadowSprite.texture = asset.texture;
        this.shadowSprite.visible = true;
        this.shadowSprite.scale.x = asset.flipH ? -1 : 1;
        this.shadowSprite.pivot.set(asset.x, asset.y);
        this.shadowSprite.alpha = Pet.SHADOW_ALPHA;
    }

    // #endregion

    destroy(): void {
        if (this.destroyed) return;

        this.destroyed = true;
        // the textures are the library's: only the sprites go
        this.container.destroy({children: true, texture: false, baseTexture: false});
        this.sprites.clear();
        this.shadowSprite = null;
    }
}
