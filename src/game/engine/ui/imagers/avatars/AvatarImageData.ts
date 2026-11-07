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
import {Engine} from '../../../../Engine';
import { BaseTexture, SCALE_MODES } from 'pixi.js';

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

    private figureMapLookup: { [type: string]: { [id: string]: string } } = {};

    constructor() {
        this.AvatarDownloadManager = new AvatarDownloadManager();
        this.offsets = new Map();
        this.spritesheets = new Map();
        this.textures = new Map();

        BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
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
        await this.addNitroFigures();
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

    /**
     * The parts of the figure data that the NHG figures do not have (e.g. the newer clothes), drawn with the
     * Nitro figures: added to the FigureMap as "nitro:<library>". The NHG figures stay first.
     */
    private async addNitroFigures(): Promise<void> {
        if (!this.figureMap || !Engine.getInstance().config.avatarNitroFigureMapUrl) return;

        try {
            const nitroFigureMap = await this.AvatarDownloadManager.loadNitroFigureMap();
            let added = 0;

            for (const library of nitroFigureMap?.libraries ?? []) {
                for (const part of library.parts ?? []) {
                    const byType = (this.figureMap[part.type] ??= {});
                    const id = String(part.id);
                    if (byType[id]) continue;

                    byType[id] = AvatarDownloadManager.NITRO_PREFIX + library.id;
                    added++;
                }
            }

            console.info(`Avatar figures: ${added} parts from the Nitro figures`);
        } catch (e) {
            console.warn('Avatar figures: no Nitro FigureMap, only the NHG figures', e);
        }
    }

    getTexture(assetName: string): Texture | null {
        const texture = this.textures.get(assetName);

        if (!texture) return null;

        return texture;
    }

    /** The downloads in progress: the avatars drawn together (e.g. the change look) share them. */
    private loadingTextures = new Map<string, Promise<void>>();
    private loadingParts = new Map<string, Promise<void>>();

    /** The bitmap of a library. A missing one is not drawn: the avatar is drawn without it. */
    loadTexture(assetName: string): Promise<void> {
        if (this.textures.has(assetName)) return Promise.resolve();

        let loading = this.loadingTextures.get(assetName);
        if (!loading) {
            loading = this.AvatarDownloadManager.loadTexture(assetName)
                .then(texture => {
                    if (texture) this.textures.set(assetName, texture);
                })
                .catch(e => console.warn(`Avatar library ${assetName}: no bitmap`, e))
                .finally(() => this.loadingTextures.delete(assetName));
            this.loadingTextures.set(assetName, loading);
        }

        return loading;
    }

    /**
     * The spritesheet of a library (<library>/<library>.json, the offsets are in the same file): downloaded once.
     * A missing or invalid one is remembered as empty, so its parts are skipped and it is not asked again.
     */
    loadPart(part: string): Promise<void> {
        if (this.spritesheets.has(part)) return Promise.resolve();

        let loading = this.loadingParts.get(part);
        if (!loading) {
            loading = this.AvatarDownloadManager.loadSpriteSheet(part)
                .catch((e: unknown) => {
                    console.warn(`Avatar library ${part}: no spritesheet`, e);
                    return null;
                })
                .then((spritesheet: any) => {
                    this.offsets.set(part, spritesheet);
                    this.spritesheets.set(part, spritesheet);
                })
                .finally(() => this.loadingParts.delete(part));
            this.loadingParts.set(part, loading);
        }

        return loading;
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
