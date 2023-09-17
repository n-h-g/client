import IAvatarAnimations, {IAnimation} from '../gamedata/IAvatarAnimations';
import Animation from './Animation';

export default class AvatarAnimations {
    /**
     *  action id       |       Animation
     */
    private animations: Map<string, Animation>;

    public constructor(animationsData: IAvatarAnimations) {
        this.animations = new Map();

        this.loadAnimations(animationsData.animations);

        //console.log(this.animations)
    }

    public getAnimation(actionId: string): Animation | null {
        const animation = this.animations.get(actionId);

        if (!animation) return;

        return animation;
    }

    private loadAnimations(animations: IAnimation[]): void {
        if (animations && animations.length > 0) {
            for (const animation of animations) {
                const newAnimation = new Animation(animation);

                this.animations.set(newAnimation.id, newAnimation);
            }
        }
    }
}
