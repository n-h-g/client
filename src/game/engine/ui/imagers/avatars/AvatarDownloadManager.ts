import {fetchJsonAsync} from '../../../../utils/DownloadManager';

import * as PIXI from 'pixi.js';
import RenderingUtils from '../../../../utils/RenderingUtils';
import {Engine} from '../../../../Engine';

export default class AvatarDownloadManager {
    public loadConfigFile(resource: string): any {
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

    public async loadTexture(assetName: string): Promise<any> {
        const url = `${
            Engine.getInstance().config.avatarFigurePath
        }/${assetName}/${assetName}.png`;
        return await PIXI.Assets.load(url);
    }

    public loadSpriteSheet(part: string): Promise<any> {
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
    public loadOffsets(part: string) {
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
