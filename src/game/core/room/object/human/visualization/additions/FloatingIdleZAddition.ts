import {Container, Sprite, Texture} from 'pixi.js';
import idleLeft1 from '../../../../../../../assets/images/avatar/user_idle_left_1.png';
import idleLeft2 from '../../../../../../../assets/images/avatar/user_idle_left_2.png';
import idleRight1 from '../../../../../../../assets/images/avatar/user_idle_right_1.png';
import idleRight2 from '../../../../../../../assets/images/avatar/user_idle_right_2.png';

/**
 * The "zzz" next to the head of an idle avatar (as Nitro's FloatingIdleZAddition): a Z appears at once (Nitro waits 2 seconds: here
 * the user sees it as soon as the action starts), then every 2 seconds it changes with the second one and back. It's on the side the avatar looks at.
 */
export class FloatingIdleZAddition {
    private static readonly DELAY_BEFORE_ANIMATION = 0;
    private static readonly DELAY_PER_FRAME = 2000;
    /** Nitro's offsets from the feet of the avatar (large scale). */
    private static readonly OFFSET_X_RIGHT = 22;
    private static readonly OFFSET_X_LEFT = -30;
    private static readonly OFFSET_Y = -70;
    /** In front of the avatar parts and of the effects. */
    private static readonly Z_INDEX = 1001;

    private static readonly IMAGES = {
        left: [idleLeft1, idleLeft2],
        right: [idleRight1, idleRight2],
    };

    private sprite: Sprite | null = null;
    /** When the avatar went idle, 0 if it's not. */
    private startTime = 0;
    private timer: ReturnType<typeof setInterval> | undefined;
    private side: 'left' | 'right' = 'left';

    /**
     * Shows the Z on the avatar container (or removes it). The container changes every time the avatar is drawn:
     * the animation goes on from where it was.
     *
     * @param container the avatar container (see TypingBubbleAddition).
     * @param direction the direction of the avatar (0..7): the Z is on the right for 3, 4, 5 and 6 (Nitro's angles
     *                  135..270).
     * @param postureOffset where the Z goes from its standing place (see TypingBubbleAddition).
     */
    update(
        container: Container | null | undefined,
        visible: boolean,
        canvasWidth: number,
        direction: number,
        postureOffset: {x: number; y: number}
    ): void {
        if (!visible || !container || container.destroyed) {
            this.remove();
            return;
        }

        if (!this.startTime) {
            this.startTime = performance.now();
            this.timer = setInterval(() => this.animate(), 250);
        }

        if (!this.sprite || this.sprite.destroyed) this.sprite = new Sprite();

        this.side = direction >= 3 && direction <= 6 ? 'right' : 'left';
        this.sprite.x = canvasWidth / 2 + postureOffset.x
            + (this.side === 'right' ? FloatingIdleZAddition.OFFSET_X_RIGHT : FloatingIdleZAddition.OFFSET_X_LEFT);
        this.sprite.y = FloatingIdleZAddition.OFFSET_Y + postureOffset.y;
        this.sprite.zIndex = FloatingIdleZAddition.Z_INDEX;
        this.sprite.eventMode = 'none';

        if (this.sprite.parent !== container) container.addChild(this.sprite);
        this.animate();
    }

    /** The frame of now: the two Z in turn. */
    private animate(): void {
        if (!this.sprite || this.sprite.destroyed || !this.startTime) return;

        const elapsed = performance.now() - this.startTime - FloatingIdleZAddition.DELAY_BEFORE_ANIMATION;
        if (elapsed < 0) {
            this.sprite.visible = false;
            return;
        }

        const frame = Math.floor(elapsed / FloatingIdleZAddition.DELAY_PER_FRAME) % 2;
        this.sprite.texture = Texture.from(FloatingIdleZAddition.IMAGES[this.side][frame]);
        this.sprite.visible = true;
    }

    remove(): void {
        clearInterval(this.timer);
        this.timer = undefined;
        this.startTime = 0;
        this.sprite?.parent?.removeChild(this.sprite);
    }
}
