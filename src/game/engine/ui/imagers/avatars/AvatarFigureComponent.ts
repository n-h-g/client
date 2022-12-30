import { IPart } from "./gamedata/IFigureData";
import PartSet from "./structure/figure/Set";

export default class AvatarFigureComponent {

    public part: IPart

    public color: string | null;

    public constructor(part: IPart, color: string) {
        this.part = part;
        this.color = color;
    }
}