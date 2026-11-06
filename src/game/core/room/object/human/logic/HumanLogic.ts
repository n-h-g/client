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
    constructor(human: Human) {
        super(human);
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
