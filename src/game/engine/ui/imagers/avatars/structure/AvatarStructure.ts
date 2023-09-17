import {Actions} from '../actions/AvatarActions';
import {AvatarAnimations} from '../animation/AvatarAnimations';
import {Assets} from '../assets/Assets';
import {AvatarData} from '../enum/AvatarData';
import {AvatarActions} from '../gamedata/IAvatarActions';
import {IAvatarAnimations} from '../gamedata/IAvatarAnimations';
import {IGeometry} from '../gamedata/IAvatarGeometry';
import {IAvatarPartSetsData} from '../gamedata/IAvatarPartSetsData';
import {IFigureData} from '../gamedata/IFigureData';
import {FigureMap} from '../gamedata/IFigureMap';
import {AvatarGeometry} from '../geometry/AvatarGeometry';
import {AvatarFigureData} from './AvatarFigureData';
import {AvatarPartSets} from './AvatarPartSets';

export class AvatarStructure {
    private geometry: AvatarGeometry | null = null;
    private partSets: AvatarPartSets | null = null;
    private avatarFigureData: AvatarFigureData | null = null;
    private avatarActions: Actions | null = null;
    private assets: Assets | null = null;
    private animations: AvatarAnimations | null = null;

    constructor() {
        this.geometry = null;
        this.partSets = null;
        this.avatarFigureData = null;
        this.avatarActions = null;
        this.assets = null;
        this.animations = null;
    }

    getBodyPartsAtAngle(direction: number) {
        const angle = AvatarData.AVATAR_ANGLES[direction];
    }

    setAnimations(animations: IAvatarAnimations) {
        this.animations = new AvatarAnimations(animations);
    }

    setGeometry(geometry: IGeometry): void {
        this.geometry = new AvatarGeometry(geometry);
    }

    setAvatarFigureData(figureData: IFigureData) {
        this.avatarFigureData = new AvatarFigureData(figureData);
    }

    setActions(actions: AvatarActions) {
        this.avatarActions = new Actions(actions);
    }

    setPartSets(partSets: IAvatarPartSetsData): void {
        this.partSets = new AvatarPartSets(partSets);
    }

    setAssetsManager(assets: FigureMap): void {
        this.assets = new Assets(assets);
    }

    get Geometry(): AvatarGeometry | null {
        return this.geometry;
    }

    get Animations(): AvatarAnimations | null {
        return this.animations;
    }

    get Assets(): Assets | null {
        return this.assets;
    }

    get Actions(): Actions | null {
        return this.avatarActions;
    }

    get AvatarFigureData(): AvatarFigureData | null {
        return this.avatarFigureData;
    }

    get PartSets(): AvatarPartSets | null {
        return this.partSets;
    }
}
