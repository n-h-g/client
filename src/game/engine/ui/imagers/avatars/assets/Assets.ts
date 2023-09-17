import FigureMap from '../gamedata/IFigureMap';
import Asset from './Asset';

export default class Assets {
    /**
     *  partSetType - Asset
     */
    private assets: Map<string, Asset>;

    private missingAssets: Map<string, Asset>;

    private figureMap: FigureMap;

    public constructor(figureMap: FigureMap) {
        this.assets = new Map();
        this.missingAssets = new Map();

        this.figureMap = figureMap;
    }

    public getUniqueName(type: string, partId: number): string {
        let uniqueName = this.figureMap[type][partId];

        if (uniqueName == null && type == 'hrb') {
            uniqueName = this.figureMap['hr'][partId];
        }

        if (uniqueName == null) {
            uniqueName = this.figureMap[type][1];
        }

        if (uniqueName == null) {
            uniqueName = this.figureMap[type][0];
        }

        return uniqueName ?? '';
    }
}
