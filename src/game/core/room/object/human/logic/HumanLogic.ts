import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import AvatarData from "../../../../../engine/ui/imagers/avatars/enum/AvatarData";
import { EntityLogic } from "../../entities/EntityLogic";
import Human from "../Human";
import { HumanVisualization } from "../visualization/HumanVisualization";

export abstract class HumanLogic extends EntityLogic {

    public constructor(human: Human) {
        super(human)
    }

    protected abstract figureChanged(): void

    public onLoad(): void {
        //this.entity.visualization.draw()
    }

    public tick(delta: number): void {
        let humanVisualization = this.entity.visualization as HumanVisualization

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

}