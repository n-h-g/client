import {IPart} from './gamedata/IFigureData';
import {PartSet} from './structure/figure/Set';

export class AvatarFigureComponent {
    part: IPart;

    color: string | null;

    constructor(part: IPart, color: string) {
        this.part = part;
        this.color = color;
    }
}
