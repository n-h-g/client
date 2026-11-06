import {fetchJsonAsync} from '../../../../utils/DownloadManager';

import * as PIXI from 'pixi.js';

import {Engine} from '../../../../Engine';

export class AvatarDownloadManager {
    loadConfigFile(resource: string): any {
        return new Promise((resolve, reject) => {
            try {
                resolve(
                    fetchJsonAsync(
                        `${
                            Engine.getInstance().config.avatarGameDataPath
                        }/${resource}.json`
                    )
                );
            } catch (e) {
                console.log(e);
            }
        });
    }

    async loadTexture(assetName: string): Promise<any> {
        const url = `${
            Engine.getInstance().config.avatarFigurePath
        }/${assetName}/${assetName}.png`;
        return await PIXI.Assets.load(url);
    }

    loadSpriteSheet(part: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                resolve(
                    fetchJsonAsync(
                        `${
                            Engine.getInstance().config.avatarFigurePath
                        }/${part}/${part}.json`
                    )
                );
            } catch (e) {
                console.log(e);
            }
        });
    }
    /** An effect library (effects/<lib>/<lib>.json): its animation, assets and spritesheet frames. */
    loadEffectLibrary(lib: string): Promise<any> {
        return fetchJsonAsync(`${Engine.getInstance().config.avatarEffectPath}/${lib}/${lib}.json`);
    }

    /** The spritesheet of an effect library. */
    async loadEffectTexture(lib: string, image: string = `${lib}.png`): Promise<any> {
        return await PIXI.Assets.load(`${Engine.getInstance().config.avatarEffectPath}/${lib}/${image}`);
    }

    loadOffsets(part: string) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            try {
                request.open(
                    'GET',
                    `${
                        Engine.getInstance().config.avatarFigurePath
                    }/${part}/${part}.json`
                );
                request.send();
                request.onloadend = e => {
                    const data = JSON.parse(request.responseText);
                    resolve(data);
                };
                request.onerror = e => {
                    throw new Error('invalid_offset');
                };
            } catch (e) {
                console.log(e);
            }
        });
    }
}
