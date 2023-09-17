import Actions from '../actions/AvatarActions';
import AvatarAnimations from '../animation/AvatarAnimations';
import Assets from '../assets/Assets';
import AvatarData from '../enum/AvatarData';
import AvatarActions from '../gamedata/IAvatarActions';
import IAvatarAnimations from '../gamedata/IAvatarAnimations';
import {IGeometry} from '../gamedata/IAvatarGeometry';
import IAvatarPartSetsData from '../gamedata/IAvatarPartSetsData';
import IFigureData from '../gamedata/IFigureData';
import FigureMap from '../gamedata/IFigureMap';
import AvatarGeometry from '../geometry/AvatarGeometry';
import AvatarFigureData from './AvatarFigureData';
import AvatarPartSets from './AvatarPartSets';

export default class AvatarStructure {
    private geometry: AvatarGeometry | null = null;
    private partSets: AvatarPartSets | null = null;
    private avatarFigureData: AvatarFigureData | null = null;
    private avatarActions: Actions | null = null;
    private assets: Assets | null = null;
    private animations: AvatarAnimations | null = null;

    public constructor() {
        this.geometry = null;
        this.partSets = null;
        this.avatarFigureData = null;
        this.avatarActions = null;
        this.assets = null;
        this.animations = null;
    }

    public getBodyPartsAtAngle(direction: number) {
        const angle = AvatarData.AVATAR_ANGLES[direction];
    }

    public setAnimations(animations: IAvatarAnimations) {
        this.animations = new AvatarAnimations(animations);
    }

    public setGeometry(geometry: IGeometry): void {
        this.geometry = new AvatarGeometry(geometry);
    }

    public setAvatarFigureData(figureData: IFigureData) {
        this.avatarFigureData = new AvatarFigureData(figureData);
    }

    public setActions(actions: AvatarActions) {
        this.avatarActions = new Actions(actions);
    }

    public setPartSets(partSets: IAvatarPartSetsData): void {
        this.partSets = new AvatarPartSets(partSets);
    }

    public setAssetsManager(assets: FigureMap): void {
        this.assets = new Assets(assets);
    }

    public get Geometry(): AvatarGeometry | null {
        return this.geometry;
    }

    public get Animations(): AvatarAnimations | null {
        return this.animations;
    }

    public get Assets(): Assets | null {
        return this.assets;
    }

    public get Actions(): Actions | null {
        return this.avatarActions;
    }

    public get AvatarFigureData(): AvatarFigureData | null {
        return this.avatarFigureData;
    }

    public get PartSets(): AvatarPartSets | null {
        return this.partSets;
    }
}
