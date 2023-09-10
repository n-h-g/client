import AvatarDownloadManager from "./AvatarDownloadManager";
import AvatarActions from "./gamedata/IAvatarActions";
import IAvatarAnimations from "./gamedata/IAvatarAnimations";
import AvatarDrawOrder from "./gamedata/IAvatarDrawOrder";
import IAvatarGeometry from "./gamedata/IAvatarGeometry";
import IAvatarPartSetsData from "./gamedata/IAvatarPartSetsData";
import IFigureData from "./gamedata/IFigureData";
import FigureMap from "./gamedata/IFigureMap";
import { IAvatarImageData } from "./gamedata/IAvatarImageData";
import { Texture } from "pixi.js";

export default class AvatarImageData implements IAvatarImageData {

    public AvatarDownloadManager: AvatarDownloadManager;

    public avatarActions?: AvatarActions;
    public avatarPartSets?: IAvatarPartSetsData;
    public avatarGeometry?: IAvatarGeometry;
    public avatarDrawOrder?: AvatarDrawOrder;
    public avatarAnimations?: IAvatarAnimations;

    private ready: boolean = false;

    public figureMap?: FigureMap;
    public figureData?: IFigureData;

    private offsets: Map<string, any>;

    private spritesheets: Map<string, any>;

    private textures: Map<string, Texture>


    constructor() {
        this.AvatarDownloadManager = new AvatarDownloadManager();
        this.offsets = new Map();
        this.spritesheets = new Map();
        this.textures = new Map();
    }

    public async loadGameData(): Promise<void> {
        this.figureData = await this.AvatarDownloadManager.loadConfigFile("FigureData");
        this.avatarGeometry = await this.AvatarDownloadManager.loadConfigFile("HabboAvatarGeometry");
        this.figureMap = await this.AvatarDownloadManager.loadConfigFile("FigureMap");
        this.avatarActions = await this.AvatarDownloadManager.loadConfigFile("HabboAvatarActions");
        this.avatarPartSets = await this.AvatarDownloadManager.loadConfigFile("HabboAvatarPartSets");
        this.avatarDrawOrder = await this.AvatarDownloadManager.loadConfigFile("AvatarDrawOrder");
        this.avatarAnimations = await this.AvatarDownloadManager.loadConfigFile("HabboAvatarAnimations");
    }

    public getTexture(assetName: string): Texture | null {
        const texture = this.textures.get(assetName)

        if (!texture) return null;

        return texture;
    }

    public async loadTexture(assetName: string) {
        if (!this.textures.has(assetName)) {
            const texture = await this.AvatarDownloadManager.loadTexture(assetName);
            this.textures.set(assetName, texture)
        }
    }

    public async loadPart(part: string) {
        if (!this.offsets.has(part)) {
            let offset = await this.AvatarDownloadManager.loadOffsets(part);
            this.offsets.set(part, offset);
        }

        if (!this.spritesheets.has(part)) {
            let spritesheet = await this.AvatarDownloadManager.loadSpriteSheet(part);
            this.spritesheets.set(part, spritesheet)
        }
    }

    public async getSpriteSheet(partType: string): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.spritesheets.has(partType)) {
                resolve(this.spritesheets.get(partType))
            } else {
                resolve(this.loadPart(partType))
            }
        });
    }

    public get Ready(): boolean { return this.ready; }
    public get Offsets(): Map<string, any> { return this.offsets; }
    public get SpriteSheets(): Map<string, any> { return this.spritesheets; }
}