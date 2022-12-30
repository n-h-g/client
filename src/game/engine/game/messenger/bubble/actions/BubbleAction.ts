import { IBubbleAction } from "./IBubbleAction";



export default abstract class BubbleAction implements IBubbleAction {

    public constructor() {
    }

    public abstract isClickable(): boolean

}