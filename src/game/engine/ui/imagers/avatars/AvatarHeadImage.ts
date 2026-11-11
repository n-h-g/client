import {Container} from 'pixi.js';
import {Engine} from '../../../../Engine';
import {UiUtils} from '../../../../utils/UiUtils';
import {Avatar} from './Avatar';
import {ActionId} from './enum/actions/ActionId';
import {AvatarEventsType} from './enum/events/AvatarEventsType';

/**
 * Images (data urls) of an avatar for the UI: the head (e.g. the friends in the bottom bar)
 * or the whole avatar (e.g. the profile). The images are cached by look: the same friend is drawn once.
 */
export class AvatarHeadImage {
    private static cache = new Map<string, Promise<string>>();

    /** The head with what is on it (face, hair, hat). */
    static get(figure: string): Promise<string> {
        return this.cached(figure, true);
    }

    /** The whole standing avatar, turned to a direction (0-7, 2 by default as Habbo's previews). */
    static full(figure: string, direction = 2): Promise<string> {
        return this.cached(figure, false, direction);
    }

    private static cached(figure: string, headOnly: boolean, direction = 2): Promise<string> {
        if (!figure) return Promise.resolve('');

        const key = (headOnly ? 'head:' : `full${direction}:`) + figure;

        let image = this.cache.get(key);
        if (!image) {
            image = this.generate(figure, headOnly, direction).catch(() => '');
            this.cache.set(key, image);

            // e.g. asked before the avatar imager is ready: drawn again next time
            image.then(result => {
                if (!result) this.cache.delete(key);
            });
        }

        return image;
    }

    private static async generate(figure: string, headOnly: boolean, direction: number): Promise<string> {
        const engine = Engine.getInstance();
        const imager = engine?.userInterfaceManager?.avatarImager;
        if (!imager) return '';

        // the standing posture, as the change look previews
        const actions = new Set<ActionId>(['std' as ActionId]);
        // drawn for the UI (no shadow)
        const avatar = new Avatar(figure, direction, direction, actions, 0, 0, false, false, true);

        await imager.loadAvatar(avatar);

        return new Promise(resolve => {
            avatar.Events?.on(AvatarEventsType.LOAD_COMPLETE, () => {
                const renderer = (engine as any).application?.renderer;
                if (!renderer) {
                    resolve('');
                    return;
                }

                let image: Container;
                if (headOnly) {
                    // the parts on the head, in the order they are drawn on the avatar
                    image = new Container();
                    for (const part of [
                        avatar.HeadContainer,
                        avatar.HairContainer,
                        avatar.HatContainer,
                        avatar.FaceContainer,
                        avatar.HeadAccessoryContainer,
                    ]) {
                        if (part) image.addChild(part);
                    }
                } else {
                    avatar.ShadowContainer.visible = false;
                    image = avatar.Container;
                }

                // at density 1 (see UiUtils): the head is as big as on a normal screen
                const canvas = UiUtils.generateCanvasFromObject(image) as HTMLCanvasElement;
                resolve(UiUtils.trimCanvas(canvas).toDataURL());
                image.destroy({children: true});
            });

            // e.g. a library that cannot be drawn: no image, not a promise that never ends
            imager.drawAvatar(avatar).catch(e => {
                console.warn('Avatar image of ' + figure, e);
                resolve('');
            });
        });
    }
}
