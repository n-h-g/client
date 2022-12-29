import AvatarFigure from "./AvatarFigure";
import AvatarFigureComponent from "./AvatarFigureComponent";
import { FigureDataComponent } from "./AvatarImager";
import { IPart } from "./gamedata/IFigureData";

export default class AvatarFigureDataPart {
    public components: AvatarFigureComponent[]

    public hidden: string[]

    public parts: IPart[]

    private avatarFigure: AvatarFigure;

    public type: string

    public constructor(avatarFigure: AvatarFigure, type: string, parts: IPart[] = []) {
        this.avatarFigure = avatarFigure;
        this.type = type;
        this.parts = parts

        this.components = []
        this.hidden = []
    }

    public addComponent(figureDataComponent: AvatarFigureComponent) {
        this.components.push(figureDataComponent)
    }

    public addHidden(hidden: string) {
        this.hidden.push(hidden)
    }

    public setParts(parts: IPart[]) {
        this.parts = parts
    }
}