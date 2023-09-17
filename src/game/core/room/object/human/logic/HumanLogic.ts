import {HumanEvents} from '../../../../../engine/events/room/objects/entities/HumanEvents';
import {ActionId} from '../../../../../engine/ui/imagers/avatars/enum/actions/ActionId';
import {AvatarData} from '../../../../../engine/ui/imagers/avatars/enum/AvatarData';
import {EntityLogic} from '../../entities/EntityLogic';
import {Human} from '../Human';
import {HumanVisualization} from '../visualization/HumanVisualization';

export abstract class HumanLogic extends EntityLogic {
    constructor(human: Human) {
        super(human);
    }

    registerEvents(): void {
        super.registerEvents();
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

            if (this.frameTracker >= AvatarData.AVATAR_FRAME_SPEED) {
                humanVisualization.nextFrame();
                this.frameTracker = 0;
                humanVisualization.draw();
            }
            if (humanVisualization.actions.has(ActionId.WALK)) {
                this.onMove(delta);
            }
        }
    }

	protected abstract figureChanged(): void;
}
