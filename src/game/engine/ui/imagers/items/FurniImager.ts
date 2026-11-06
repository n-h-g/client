import {FurniBase} from './FurniBase';
import {fetchJsonAsync} from '../../../../utils/DownloadManager';
import {
    Furnidata,
    IFurnidata,
} from '../../../../core/ui/imagers/items/data/IFurnidata';
import {Engine} from '../../../../Engine';
import {Logger} from '../../../../utils/Logger';
import {FurniDataType} from '../../../../core/ui/imagers/items/data/IFurniDataType';
import {Furni} from './Furni';
import {Texture} from 'pixi.js';
import {FurnidataItemType} from './enum/FurniDataItemType';
import {FurniSpriteUtils} from './utils/FurniSpriteUtils';
import {FurniPlaceholder} from './FurniPlaceholder';
import {Repository} from '../../../../core/Repository';

export class FurniImager {
    static FPS = 24;
    private textureCaches: Repository<string, Texture>;
    private ready: boolean;
    private bases: {
        flooritem: {
            [id: string]: Promise<FurniBase>;
        };
        wallitem: {
            [id: string]: Promise<FurniBase>;
        };
    };
    private furnidata: Furnidata;

    constructor() {
        this.ready = false;
        this.bases = {
            flooritem: {},
            wallitem: {},
        };
        this.furnidata = {
            floorItems: {},
            wallItems: {},
        };

        this.textureCaches = new Repository();
    }

    async init(): Promise<void> {
        await this.loadFurnidata();
    }

    private async loadFurnidata(): Promise<void> {
        const config = Engine.getInstance()?.config;
        const url = config?.furnidataUrl ?? config?.itemsResourcesUrl + 'furnidata.json';

        const data = await fetchJsonAsync<any>(url);
        if (data == null) {
            if (config?.debug)
                Logger.error('Cannot load furnidata');

            this.ready = false;
            return;
        }

        this.furnidata = {
            floorItems: FurniImager.indexById(data.floorItems),
            wallItems: FurniImager.indexById(data.wallItems),
        };
        this.ready = true;
    }

    /**
     * The Nitro FurnitureData.json has arrays of items (with dimensions, canSitOn...),
     * the old furnidata.json objects indexed by id (with xdim, cansiton...): both become objects by id.
     */
    private static indexById(items: any): {[id: number]: any} {
        if (!items) return {};
        if (!Array.isArray(items)) return items;

        const result: {[id: number]: any} = {};

        for (const item of items) {
            result[item.id] = {
                ...item,
                xdim: item.xdim ?? item.dimensions?.x,
                ydim: item.ydim ?? item.dimensions?.y,
                canstandon: item.canstandon ?? item.canStandOn,
                cansiton: item.cansiton ?? item.canSitOn,
                canlayon: item.canlayon ?? item.canLayOn,
            };
        }

        return result;
    }

    generateRandomItem(): string | null {
        const items = Object.values(this.furnidata.floorItems);

        if (items.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * items.length);

        const item = items[randomIndex];

        return item ? item.className : null;
    }

    private findItemByName(itemName: string) {
        for (const itemId in this.furnidata.floorItems) {
            const item = this.furnidata.floorItems[itemId];
            //console.log(item);
            if (item.className.trim().toLowerCase() === itemName.trim().toLowerCase()) {
                return {
                    item,
                    type: FurniDataType.FLOOR_ITEMS,
                };
            }
        }

        for (const itemId in this.furnidata.wallItems) {
            const item = this.furnidata.wallItems[itemId];
            if (item.className.trim().toLowerCase() === itemName.trim().toLowerCase()) {
                return {
                    item,
                    type: FurniDataType.WALL_ITEMS,
                };
            }
        }

        return null;
    }

    loadFurniBase(
        type: FurnidataItemType,
        furniBaseName: string
    ): Promise<FurniBase> {
        const rawItem = this.findItemByName(furniBaseName);

        if (rawItem == null) {
            return new Promise((_resolve, reject) => {
                reject('invalid furniBaseName ' + furniBaseName);
            });
        }

        const rawItemName = rawItem.item.className;

        const {itemName, colorId} =
            FurniSpriteUtils.splitItemNameAndColor(rawItemName);

        if (this.bases[type][itemName] == null) {
            this.bases[type][itemName] = new Promise((resolve, _reject) => {
                //Load furni json
                this.fetchOffsetAsync(itemName)
                    .then(data => {
                        const furniBase = new FurniBase(
                            data as IFurnidata,
                            itemName
                        );
                        furniBase.init().then(() => {
                            resolve(furniBase);
                        });
                    })
                    .catch(() => {
                        Logger.error(
                            '[Furni] Unable to find assets of item ' + itemName
                        );
                    });
            });
        }

        return this.bases[type][itemName];
    }

    loadFurniPlaceholder(
        type: FurnidataItemType,
        name: string
    ): Promise<Furni> {
        return new Promise((res, _rej) => {
            const furniSprite = new FurniPlaceholder(null);
            res(furniSprite);
        });
    }

    loadFurniSprite(
        type: FurnidataItemType,
        name: string
    ): Promise<Furni> {
        return new Promise((res, _rej) => {
            this.loadFurniBase(type, name)
                .then(furnibase => {
                    const furniSprite = new Furni(furnibase);
                    furniSprite.colorId = FurniSpriteUtils.splitItemNameAndColor(name).colorId;
                    res(furniSprite);
                })
                .catch(e => {
                    throw e;
                });
        });
    }

    loadFurniIcon(
        type: FurnidataItemType,
        name: string
    ): Promise<Furni> {
        const {colorId} = FurniSpriteUtils.splitItemNameAndColor(name);

        return new Promise((res, _rej) => {
            this.loadFurniBase(type, name)
                .then(furnibase => {
                    const furniSprite = new Furni(furnibase);
                    furniSprite.colorId = colorId;
                    furniSprite.setIcon(true);
                    res(furniSprite);
                })
                .catch(() => {
                    _rej('invalid furniBase name' + name);
                });
        });
    }

    private fetchOffsetAsync(uniqueName: string) {
        return new Promise((resolve, reject) => {
            fetchJsonAsync(
                Engine.getInstance().config.itemsResourcesUrl +
                    uniqueName +
                    '/' +
                    uniqueName +
                    '.json'
            )
                .then(data => {
                    resolve(data);
                })
                .catch(err => reject(err));
        });
    }

    addTexture(id: string, texture: Texture): void {
        this.textureCaches.add(id, texture);
    }

    hasTexture(id: string): boolean {
        return this.textureCaches.has(id);
    }

    getTexture(id: string): Texture {
        return this.textureCaches.get(id);
    }

    get isReady(): boolean {
        return this.ready;
    }

    getFurnidata(): Furnidata {
        return this.furnidata;
    }
}
