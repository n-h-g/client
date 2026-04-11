import {FigureMap} from '../gamedata/IFigureMap';
import {Asset} from './Asset';

export class Assets {
    /**
     *  partSetType - Asset
     */
    private assets: Map<string, Asset>;

    private missingAssets: Map<string, Asset>;

    private figureMap: FigureMap;

    constructor(figureMap: FigureMap) {
        this.assets = new Map();
        this.missingAssets = new Map();

        this.figureMap = figureMap;
    }

    getUniqueName(type: string, partId: number | string): string {
        const idKey = partId.toString();

        if (!this.figureMap[type]) {
            return '';
        }

        let uniqueName = this.figureMap[type][idKey];

        if (!uniqueName && type === 'hrb') {
            uniqueName = this.figureMap['hr']?.[idKey];
        }

        if (!uniqueName) {
            //console.warn(`[FigureMap] ID ${idKey} missing for type ${type}. Falling back.`);
            uniqueName = this.figureMap[type]["1"] || this.figureMap[type]["0"];
        }

        return uniqueName ?? '';
    }
}
