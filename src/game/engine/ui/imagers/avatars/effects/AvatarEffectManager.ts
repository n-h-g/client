import {Logger} from '../../../../../utils/Logger';
import {AvatarDownloadManager} from '../AvatarDownloadManager';
import {IEffectLibrary, IEffectMap, IEffectMapEntry} from '../gamedata/IAvatarEffect';
import {AvatarEffect} from './AvatarEffect';
import {AvatarEffectAnimation} from './AvatarEffectAnimation';
import {AvatarEffectAssets} from './AvatarEffectAssets';

/**
 * Loads the avatar effects (as Nitro's EffectAssetDownloadManager): the effect id is looked up in
 * EffectMap.json, then its library is downloaded once and shared by all the avatars with that effect.
 */
export class AvatarEffectManager {
    private effectMap: Promise<Map<number, IEffectMapEntry>> | null = null;
    private readonly effects = new Map<number, Promise<AvatarEffect | null>>();

    constructor(private readonly downloadManager: AvatarDownloadManager) {}

    /**
     * @returns the effect, null if there is no effect with that id (or its library can't be loaded).
     */
    load(effectId: number): Promise<AvatarEffect | null> {
        if (!effectId || effectId < 0) return Promise.resolve(null);

        let effect = this.effects.get(effectId);
        if (!effect) {
            effect = this.loadEffect(effectId);
            this.effects.set(effectId, effect);
        }

        return effect;
    }

    private async loadEffect(effectId: number): Promise<AvatarEffect | null> {
        try {
            const entry = (await this.getEffectMap()).get(effectId);
            if (!entry) {
                Logger.debug(`Avatar effect ${effectId} is not in the effect map`);
                return null;
            }

            const library: IEffectLibrary = await this.downloadManager.loadEffectLibrary(entry.lib);
            const animationData = AvatarEffectManager.findAnimation(library, effectId);
            if (!animationData) return null;

            const sheet = await this.downloadManager.loadEffectTexture(entry.lib, library.spritesheet?.meta?.image);

            return new AvatarEffect(
                effectId,
                entry.lib,
                new AvatarEffectAnimation(animationData),
                new AvatarEffectAssets(library, sheet)
            );
        } catch (e) {
            Logger.debug(`Can't load the avatar effect ${effectId}: ${e}`);
            // it can be asked again (e.g. the assets server was not reachable)
            this.effects.delete(effectId);
            return null;
        }
    }

    /** The effects ("fx") of the map by id: the dances have their own animations. */
    private getEffectMap(): Promise<Map<number, IEffectMapEntry>> {
        if (!this.effectMap) {
            this.effectMap = (this.downloadManager.loadConfigFile('EffectMap') as Promise<IEffectMap>)
                .then(map => {
                    const effects = new Map<number, IEffectMapEntry>();

                    for (const entry of map?.effects ?? []) {
                        const id = Number(entry.id);
                        if (entry.type === 'fx' && Number.isInteger(id)) effects.set(id, entry);
                    }

                    return effects;
                })
                .catch(e => {
                    this.effectMap = null;
                    throw e;
                });
        }

        return this.effectMap;
    }

    /** The animation of the effect in its library ("fx.<id>"), or its only animation. */
    private static findAnimation(library: IEffectLibrary, effectId: number) {
        const animations = Object.values(library.animations ?? {});

        return animations.find(animation => animation.name === `fx.${effectId}`) ?? animations[0] ?? null;
    }
}
