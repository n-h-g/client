import { ActionId } from "../enum/actions/ActionId";
import { IAnimation, IAnimationPart } from "../gamedata/IAvatarAnimations";
import AnimationPart from "./AnimationPart";

export default class Animation{
    public id: string | ActionId

    /**
     *  SetType    |    AnimationPart
     */
    public parts: Map<string, AnimationPart>
    
    public constructor(animationData: IAnimation) {
        this.id = animationData.id;

        this.parts = new Map();

        this.loadAnimationsParts(animationData.parts)
    }

    public getAnimationPart(type: string): AnimationPart | null {
        const animationPart = this.parts.get(type);

        if(!animationPart) return null;

        return animationPart;
    }

    private loadAnimationsParts(parts: IAnimationPart[]) {
        if(parts) {
            for(let part of parts) {
                const newAnimationPart = new AnimationPart(part);

                this.parts.set(newAnimationPart.setType, newAnimationPart);
            }
        }
    }
}