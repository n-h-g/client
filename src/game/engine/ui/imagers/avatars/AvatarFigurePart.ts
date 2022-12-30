import AvatarFigure from "./AvatarFigure"
import AvatarFigureComponent from "./AvatarFigureComponent";

export default class AvatarFigurePart {

    private avatarFigure: AvatarFigure;

    public type: string;
    public id: string;
    public colors: number[]

    public constructor(avatarFigure: AvatarFigure, type: string, id: string, colors:number[] = []) {
        this.avatarFigure = avatarFigure;

        this.type = type;
        this.id = id;
        this.colors = colors;
    }
}