import {Container, Sprite, Texture} from 'pixi.js';
import typingImage from '../../../../../../../assets/images/chat/typing.png';

/**
 * The bubble over the head of an avatar that is typing (as Nitro's TypingBubbleAddition): a sprite of the
 * avatar, drawn in front of it at (14, -83) from its feet, higher when it sits or lays.
 */
export class TypingBubbleAddition {
    /** Nitro's offset of the bubble from the feet of the avatar (large scale). */
    private static readonly OFFSET_X = 14;
    private static readonly OFFSET_Y = -83;
    /** In front of the avatar parts and of the effects. */
    private static readonly Z_INDEX = 1001;

    private sprite: Sprite | null = null;

    /**
     * Shows the bubble on the avatar container (or removes it).
     *
     * @param container the avatar container: its parts are drawn from the registration point of the avatar
     *                  (the feet) at y 0 and in the middle of its canvas, as Nitro's (the head is at negative y).
     * @param canvasWidth the width of the avatar canvas (the middle is the registration point).
     * @param postureOffset where the bubble goes from its standing place, in the container: the container of a
     *                      sitting/laying avatar is already moved by its posture (see HumanVisualization).
     */
    update(
        container: Container | null | undefined,
        visible: boolean,
        canvasWidth: number,
        postureOffset: {x: number; y: number}
    ): void {
        if (!visible || !container || container.destroyed) {
            this.remove();
            return;
        }

        if (!this.sprite || this.sprite.destroyed) this.sprite = new Sprite(Texture.from(typingImage));

        this.sprite.x = canvasWidth / 2 + TypingBubbleAddition.OFFSET_X + postureOffset.x;
        this.sprite.y = TypingBubbleAddition.OFFSET_Y + postureOffset.y;
        this.sprite.zIndex = TypingBubbleAddition.Z_INDEX;
        this.sprite.eventMode = 'none';

        if (this.sprite.parent !== container) container.addChild(this.sprite);
    }

    remove(): void {
        this.sprite?.parent?.removeChild(this.sprite);
    }
}
