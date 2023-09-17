import {AvatarDownloadManager} from '../AvatarDownloadManager';
import {AvatarActions} from './IAvatarActions';
import {IAvatarAnimations} from './IAvatarAnimations';
import {AvatarDrawOrder} from './IAvatarDrawOrder';
import {IAvatarGeometry} from './IAvatarGeometry';
import {IAvatarPartSetsData} from './IAvatarPartSetsData';
import {IFigureData} from './IFigureData';
import {FigureMap} from './IFigureMap';

export interface IAvatarImageData {
    AvatarDownloadManager: AvatarDownloadManager;
    avatarActions?: AvatarActions;
    avatarPartSets?: IAvatarPartSetsData;
    avatarGeometry?: IAvatarGeometry;
    avatarDrawOrder?: AvatarDrawOrder;
    avatarAnimations?: IAvatarAnimations;

    figureData?: IFigureData;
    figureMap?: FigureMap;
}
