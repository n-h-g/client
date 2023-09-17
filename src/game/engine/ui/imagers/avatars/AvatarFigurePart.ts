import {AvatarFigure} from './AvatarFigure';
import {AvatarFigureComponent} from './AvatarFigureComponent';

export class AvatarFigurePart {
    private avatarFigure: AvatarFigure;

    type: string;
    id: string;
    colors: number[];

    constructor(
        avatarFigure: AvatarFigure,
        type: string,
        id: string,
        colors: number[] = []
    ) {
        this.avatarFigure = avatarFigure;

        this.type = type;
        this.id = id;
        this.colors = colors;
    }
}
