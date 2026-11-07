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
        const nitroLibrary = AvatarDownloadManager.nitroLibrary(assetName);
        const url = nitroLibrary
            ? `${Engine.getInstance().config.avatarNitroFigurePath}/${nitroLibrary}/${nitroLibrary}.png`
            : `${Engine.getInstance().config.avatarFigurePath}/${assetName}/${assetName}.png`;
        return await PIXI.Assets.load(url);
    }

    /**
     * <library>/<library>.json: the spritesheet and the offsets of a figure library. Rejects when missing.
     * A Nitro library (see NITRO_PREFIX) is converted to the format of the NHG libraries.
     */
    async loadSpriteSheet(part: string): Promise<any> {
        const nitroLibrary = AvatarDownloadManager.nitroLibrary(part);
        if (!nitroLibrary) {
            return fetchJsonAsync(`${Engine.getInstance().config.avatarFigurePath}/${part}/${part}.json`);
        }

        const json = await fetchJsonAsync<any>(
            `${Engine.getInstance().config.avatarNitroFigurePath}/${nitroLibrary}/${nitroLibrary}.json`
        );
        return AvatarDownloadManager.fromNitro(json);
    }

    /** The libraries of the Nitro figures (the ones the NHG figures do not have) are named "nitro:<library>". */
    static readonly NITRO_PREFIX = 'nitro:';

    /** The FigureMap of the Nitro figures: {libraries: [{id, parts: [{id, type}]}]}. */
    loadNitroFigureMap(): Promise<any> {
        return fetchJsonAsync(Engine.getInstance().config.avatarNitroFigureMapUrl);
    }

    private static nitroLibrary(name: string): string | null {
        return name.startsWith(AvatarDownloadManager.NITRO_PREFIX)
            ? name.substring(AvatarDownloadManager.NITRO_PREFIX.length)
            : null;
    }

    /**
     * A Nitro library ({name, assets: {asset: {x, y, source?}}, spritesheet: {frames: {"<name>_<asset>.png": {frame}}}})
     * as an NHG one ({asset: {offset: "x,y", left, top, width, height} or {offset, link}}).
     */
    private static fromNitro(json: any): any {
        const frames = json?.spritesheet?.frames ?? {};
        const prefix = `${json?.name}_`;
        const spritesheet: any = {};

        for (const [name, asset] of Object.entries<any>(json?.assets ?? {})) {
            const offset = `${asset.x ?? 0},${asset.y ?? 0}`;

            if (asset.source) {
                spritesheet[name] = {offset, link: asset.source};
                continue;
            }

            const frame = frames[`${prefix}${name}.png`]?.frame;
            if (!frame) continue;

            spritesheet[name] = {
                offset,
                left: String(frame.x),
                top: String(frame.y),
                width: String(frame.w),
                height: String(frame.h),
            };
        }

        return spritesheet;
    }
    /** EffectMap.json: the library of each effect id. */
    loadEffectMap(): Promise<any> {
        return fetchJsonAsync(Engine.getInstance().config.avatarEffectMapUrl);
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
