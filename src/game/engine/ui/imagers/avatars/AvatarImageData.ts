import {AvatarDownloadManager} from './AvatarDownloadManager';
import {AvatarActions} from './gamedata/IAvatarActions';
import {IAvatarAnimations} from './gamedata/IAvatarAnimations';
import {AvatarDrawOrder} from './gamedata/IAvatarDrawOrder';
import {IAvatarGeometry} from './gamedata/IAvatarGeometry';
import {IAvatarPartSetsData} from './gamedata/IAvatarPartSetsData';
import {IFigureData} from './gamedata/IFigureData';
import {FigureMap} from './gamedata/IFigureMap';
import {IAvatarImageData} from './gamedata/IAvatarImageData';
import {Texture} from 'pixi.js';

export class AvatarImageData implements IAvatarImageData {
    AvatarDownloadManager: AvatarDownloadManager;

    avatarActions?: AvatarActions;
    avatarPartSets?: IAvatarPartSetsData;
    avatarGeometry?: IAvatarGeometry;
    avatarDrawOrder?: AvatarDrawOrder;
    avatarAnimations?: IAvatarAnimations;

    private ready = false;

    figureMap?: FigureMap;
    figureData?: IFigureData;

    private offsets: Map<string, any>;

    private spritesheets: Map<string, any>;

    private textures: Map<string, Texture>;

    constructor() {
        this.AvatarDownloadManager = new AvatarDownloadManager();
        this.offsets = new Map();
        this.spritesheets = new Map();
        this.textures = new Map();
    }

    async loadGameData(): Promise<void> {
        this.figureData = await this.AvatarDownloadManager.loadConfigFile(
            'FigureData'
        );
        this.avatarGeometry = await this.AvatarDownloadManager.loadConfigFile(
            'HabboAvatarGeometry'
        );
        this.figureMap = await this.AvatarDownloadManager.loadConfigFile(
            'FigureMap'
        );
        this.avatarActions = await this.AvatarDownloadManager.loadConfigFile(
            'HabboAvatarActions'
        );
        this.avatarPartSets = await this.AvatarDownloadManager.loadConfigFile(
            'HabboAvatarPartSets'
        );
        this.avatarDrawOrder = await this.AvatarDownloadManager.loadConfigFile(
            'AvatarDrawOrder'
        );
        this.avatarAnimations = await this.AvatarDownloadManager.loadConfigFile(
            'HabboAvatarAnimations'
        );
    }

    getTexture(assetName: string): Texture | null {
        const texture = this.textures.get(assetName);

        if (!texture) return null;

        return texture;
    }

    async loadTexture(assetName: string) {
        if (!this.textures.has(assetName)) {
            const texture = await this.AvatarDownloadManager.loadTexture(
                assetName
            );
            this.textures.set(assetName, texture);
        }
    }

    async loadPart(part: string) {
        if (!this.offsets.has(part)) {
            const offset = await this.AvatarDownloadManager.loadOffsets(part);
            this.offsets.set(part, offset);
        }

        if (!this.spritesheets.has(part)) {
            const spritesheet =
                await this.AvatarDownloadManager.loadSpriteSheet(part);
            this.spritesheets.set(part, spritesheet);
        }
    }

    async getSpriteSheet(partType: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.spritesheets.has(partType)) {
                resolve(this.spritesheets.get(partType));
            } else {
                resolve(this.loadPart(partType));
            }
        });
    }

    get Ready(): boolean {
        return this.ready;
    }
    get Offsets(): Map<string, any> {
        return this.offsets;
    }
    get SpriteSheets(): Map<string, any> {
        return this.spritesheets;
    }
}
