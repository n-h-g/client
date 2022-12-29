
import { fetchJsonAsync } from "../../../../utils/DownloadManager";

import * as PIXI from 'pixi.js'
import UiUtils from "../../../../utils/UiUtils";
import RenderingUtils from "../../../../utils/RenderingUtils";
import { Engine } from "../../../../Engine";

export default class AvatarDownloadManager {

    private complete: boolean = false;

    constructor() {

    }

    public loadConfigFile(resource: string): any {
        return new Promise((resolve, reject) => {
            try {
                resolve(fetchJsonAsync(`${Engine.getInstance().config.avatarGameDataPath}/${resource}.json`));
            } catch(e) {
                console.log(e)
            }
        })
    }

    public loadTexture(assetName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const loader = new PIXI.Loader()

        const url = `${Engine.getInstance().config.avatarFigurePath}/${assetName}/${assetName}.png`;

        const onError = () => {
            //Engine.getInstance().logger?.debug("Failed to load asset " + assetName);
            loader.destroy()
            return;
        }

        loader
        .add({
            url,
            crossOrigin: 'anonymous',
            loadType: PIXI.LoaderResource.LOAD_TYPE.XHR,
            xhrType: PIXI.LoaderResource.XHR_RESPONSE_TYPE.BUFFER
        });

        loader.load((loader: PIXI.Loader, resources: Partial<Record<string, PIXI.LoaderResource>>) => {
            for(const key in resources) {
                const resource = resources[key] as PIXI.LoaderResource

                if(!resource || !resource.error) {
                    onError()
                }

                const resourceType = (resource.xhr?.getResponseHeader('Content-Type'))

                if(resourceType === 'image/png') {
                    const base64 = RenderingUtils.arrayBufferToBase64(resource.data);

                    const baseTexture = new PIXI.BaseTexture(`data:${resourceType};base64,${base64}`);

                    const texture = new PIXI.Texture(baseTexture);

                    resolve(texture)
                }

            }
        })
        })

    }

    public loadSpriteSheet(part: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                resolve(fetchJsonAsync(`${Engine.getInstance().config.avatarFigurePath}/${part}/${part}.json`));
            } catch(e) {
                console.log(e)
            }
        })
    }
    public loadOffsets(part: string) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            try
            {
                request.open('GET', `${Engine.getInstance().config.avatarFigurePath}/${part}/${part}.json`);
                request.send();
                request.onloadend = e =>
                {
                    const data = JSON.parse(request.responseText);
                    resolve(data);
                };
                request.onerror = e =>
                {
                    throw new Error('invalid_offset');
                };
            }
            catch (e)
            {
                console.log(e);
            }
        })
    }

}