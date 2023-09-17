import {AvatarFigure} from './AvatarFigure';
import {AvatarFigureComponent} from './AvatarFigureComponent';
import {IPart} from './gamedata/IFigureData';

export class AvatarFigureDataPart {
    components: AvatarFigureComponent[];

    hidden: string[];

    parts: IPart[];

    private avatarFigure: AvatarFigure;

    type: string;

    constructor(
        avatarFigure: AvatarFigure,
        type: string,
        parts: IPart[] = []
    ) {
        this.avatarFigure = avatarFigure;
        this.type = type;
        this.parts = parts;

        this.components = [];
        this.hidden = [];
    }

    addComponent(figureDataComponent: AvatarFigureComponent) {
        this.components.push(figureDataComponent);
    }

    addHidden(hidden: string) {
        this.hidden.push(hidden);
    }

    setParts(parts: IPart[]) {
        this.parts = parts;
    }
}
