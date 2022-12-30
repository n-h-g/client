import UiUtils from "../../utils/UiUtils";
import IMessage from "./IMessage";

export default abstract class BubbleMessage implements IMessage {

    public text: string;
    public uuid: string;
    public id: number = -1

    public constructor(message: string) {
        this.text = message;
        this.uuid = "ID-"+ UiUtils.guidGenerator();
    }

    public abstract compose(): void

}