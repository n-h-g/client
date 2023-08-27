import FurniBase from './FurniBase'
import { fetchJsonAsync } from '../../../../utils/DownloadManager'
import { Furnidata, IFurnidata } from '../../../../core/ui/imagers/items/data/IFurnidata'
import { Engine } from '../../../../Engine'
import { Logger } from '../../../../utils/Logger'
import { FurniDataType } from '../../../../core/ui/imagers/items/data/IFurniDataType'
import { Furni } from './Furni'
import { Sprite, Texture } from 'pixi.js'
import { FurnidataItemType } from './enum/FurniDataItemType'
import { FurniSpriteUtils } from './utils/FurniSpriteUtils'
import { FurniPlaceholder } from './FurniPlaceholder'

export default class FurniImager {

    public static FPS: number = 36

    private _textureCaches: Map<string, Texture> 

    private _spriteCaches: Sprite[]

    private ready: boolean
    
    private bases: {
        flooritem: {
            [id: string]: Promise<FurniBase>
        },
        wallitem: {
            [id: string]: Promise<FurniBase>
        }
    }
    private furnidata: Furnidata

    constructor() {
        this.ready = false;
        this.bases = {
            flooritem: {},
            wallitem: {}
        };
        this.furnidata = {
            roomitemtypes: {},
            wallitemtypes: {}
        };

        this._textureCaches = new Map();
    }

    public async init(): Promise<void> {
        await Promise.all(this.loadFiles())
    }

    private loadFiles(): Promise<void>[] {
        return [
            fetchJsonAsync(Engine.getInstance().config.itemsResourcesUrl + 'furnidata.json')
                .then(data => {
                    this.furnidata = data as Furnidata;
                    this.ready = true;
                })
                .catch(err => {
                    if (Engine.getInstance().config.debug) {
                        Logger?.error('Cannot load furnidata')
                    }
                    this.ready = false;
                }),
        ];
    }

    public generateRandomItem() {
        let randomIndex = Math.floor((Math.random() * Object.keys(this.furnidata.roomitemtypes).length) );

        return this.furnidata.roomitemtypes[randomIndex].className;
    }

    private findItemByName(itemName: string) {
        for (let itemId in this.furnidata.roomitemtypes) {
            const item = this.furnidata.roomitemtypes[itemId];
            //console.log(item);  
            if (item.className === itemName) {
                return {
                    item,
                    type: FurniDataType.FLOOR_ITEMS
                };
            }
        }

        for (let itemId in this.furnidata.wallitemtypes) {
            const item = this.furnidata.wallitemtypes[itemId];
            if (item.className === itemName) {
                return {
                    item,
                    type: FurniDataType.WALL_ITEMS
                };
            }
        }

        return null;
    }

    public loadFurniBase(type: FurnidataItemType, furniBaseName: string): Promise<FurniBase> {
        let rawItem = this.findItemByName(furniBaseName);

        if (rawItem == null) {
            return new Promise((_resolve, reject) => {
                reject('invalid furniBaseName ' + furniBaseName);
            });
        }

        const rawItemName = rawItem.item.className;

        const {
            itemName,
            colorId
        } = FurniSpriteUtils.splitItemNameAndColor(rawItemName);

        if (this.bases[type][itemName] == null) {
            this.bases[type][itemName] = new Promise((resolve, _reject) => {
                //Load furni json
                this.fetchOffsetAsync(itemName).then((data) => {
                    const furniBase = new FurniBase(data as IFurnidata, itemName)
                    furniBase.init().then(() => {
                        resolve(furniBase);
                    })
                }).catch(() => {
                    Logger.debug('[Furni] Unable to find item ' + itemName)
                })
            })
        }

        return this.bases[type][itemName]
    }

    public loadFurniPlaceholder(type: FurnidataItemType, name: string): Promise<Furni>  {
        return new Promise((res, _rej) => {
            const furniSprite = new FurniPlaceholder(null);
            res(furniSprite);
        })
    }

    public loadFurniSprite(type: FurnidataItemType, name: string): Promise<Furni> {
        return new Promise((res, _rej) => {
            this.loadFurniBase(type, name).then((furnibase) => {
                const furniSprite = new Furni(furnibase);
                res(furniSprite);
            }).catch((e)=> {
                _rej(e)
            })
        })
    }

    public loadFurniIcon(type: FurnidataItemType, name: string): Promise<Furni> {
        const {
            colorId
        } = FurniSpriteUtils.splitItemNameAndColor(name);

        return new Promise((res, _rej) => {
            this.loadFurniBase(type, name).then((furnibase) => {
                const furniSprite = new Furni(furnibase)
                furniSprite.setIcon(true)
                res(furniSprite)
            }).catch(() => {
                _rej('invalid furniBase name')
            })
        })
    }


    private fetchOffsetAsync(uniqueName: string) {
        //console.log('downloading ..' + Engine.getInstance().getConfig().proxyUrl + Engine.getInstance().getConfig().itemsResourcesUrl + uniqueName + '/' + uniqueName + '.json');
        return new Promise((resolve, reject) => {
            fetchJsonAsync(Engine.getInstance().config.itemsResourcesUrl + uniqueName + '/' + uniqueName + '.json').then(data => {
                resolve(data);
            }).catch(err => reject(err));
        });
    }
    
    public addTexture(id: string, texture: Texture): void {
        this._textureCaches.set(id, texture)
    }

    public hasTexture(id: string): boolean {
        return this._textureCaches.has(id)
    }

    public getTexture(id: string): Texture {
        return this._textureCaches.get(id)
    }

    public get isReady(): boolean {
        return this.ready
    }

    public getFurnidata(): Furnidata {
        return this.furnidata
    }
}
