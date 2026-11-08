import {HumanEvents} from '../../../../../engine/events/room/objects/entities/HumanEvents';
import { ChangeLookEventData } from '../../../../../engine/events/ui/data/avatar/ChangeLookEventData';
import { UIEvents } from '../../../../../engine/events/ui/UIEvents';
import {ActionId} from '../../../../../engine/ui/imagers/avatars/enum/actions/ActionId';
import {AvatarData} from '../../../../../engine/ui/imagers/avatars/enum/AvatarData';
import { EventManager } from '../../../../events/EventManager';
import {EntityLogic} from '../../entities/EntityLogic';
import {Human} from '../Human';
import {HumanVisualization} from '../visualization/HumanVisualization';

export abstract class HumanLogic extends EntityLogic {
    /** Nitro's AvatarLogic: a blink every 4.5 - 5.5 s, the eyes closed for 50 - 250 ms. */
    private static readonly BLINK_INTERVAL = 4500;
    private static readonly BLINK_INTERVAL_RANDOM = 1000;
    private static readonly BLINK_DURATION = 50;
    private static readonly BLINK_DURATION_RANDOM = 200;

    /** Time (ms) to the next blink and, while blinking, to the end of it. */
    private nextBlink = HumanLogic.randomBlinkInterval();
    private blinkEnd = 0;

    constructor(human: Human) {
        super(human);
    }

    private static randomBlinkInterval(): number {
        return HumanLogic.BLINK_INTERVAL + Math.random() * HumanLogic.BLINK_INTERVAL_RANDOM;
    }

    /** The avatar closes its eyes for an instant now and then (as Habbo). */
    private updateBlink(delta: number): void {
        const humanVisualization = this.entity.visualization as HumanVisualization;

        if (this.blinkEnd > 0) {
            this.blinkEnd -= delta;
            if (this.blinkEnd <= 0) {
                this.blinkEnd = 0;
                humanVisualization.setBlink(false);
            }
            return;
        }

        this.nextBlink -= delta;
        if (this.nextBlink > 0) return;

        this.nextBlink = HumanLogic.randomBlinkInterval();
        this.blinkEnd = HumanLogic.BLINK_DURATION + Math.random() * HumanLogic.BLINK_DURATION_RANDOM;
        humanVisualization.setBlink(true);
    }

    protected registerLogicEvents(): void {
        super.registerLogicEvents();
        this.events.on(HumanEvents.FIGURE_CHANGED, () => this.figureChanged());
        this.events.on(HumanEvents.FIGURE_LOADING_COMPLETE, () =>
            this.onLoad()
        );
    }

    onClick(): void {
        super.onClick();
    }

    tick(delta: number): void {
        const humanVisualization = this.entity
            .visualization as HumanVisualization;

        this.updateBlink(delta);

        // moved by a roller
        humanVisualization.updateSlide();

        if (humanVisualization.needsUpdate) {
            this.frameTracker += delta;
            // the dances and the effects are animated as Nitro (a frame every 2 updates of 41 ms)
            const frameSpeed = humanVisualization.actions.has(ActionId.DANCE) || humanVisualization.hasAnimatedEffect
                ? AvatarData.AVATAR_DANCE_FRAME_SPEED
                : AvatarData.AVATAR_FRAME_SPEED;

            if (this.frameTracker >= frameSpeed) {
                humanVisualization.nextFrame();
                this.frameTracker %= frameSpeed;
                humanVisualization.draw();
            }
            if (humanVisualization.actions.has(ActionId.WALK)) {
                this.onMove(delta);
            }
        }
    }

	protected abstract figureChanged(): void;
}
