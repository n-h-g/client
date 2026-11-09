import {Engine} from '../../../../Engine';
import {fetchJsonAsync} from '../../../../utils/DownloadManager';
import {Logger} from '../../../../utils/Logger';
import {UiUtils} from '../../../../utils/UiUtils';
import {Pet} from './Pet';
import {PetFigureData} from './PetFigureData';
import {NitroPetLibrary, PetLibrary} from './PetLibrary';
import {petLibraryName} from './PetType';

/** How a pet is drawn in an image for the UI. */
export type PetImageOptions = {
    /** 0..7 as the avatars; 2 as the inventory of Habbo. */
    direction?: number;
    headOnly?: boolean;
    posture?: string | null;
    gesture?: string | null;
};

/**
 * The pets (as Nitro's RoomContentLoader + PetVisualization): the libraries pet/<name>/<name>.json and .png are
 * downloaded once, when the first pet of that type is drawn. A Pet is the drawable (a container), getImage an image of
 * it for the UI (e.g. the inventory).
 */
export class PetImager {
    private readonly libraries = new Map<string, Promise<PetLibrary | null>>();
    private readonly images = new Map<string, Promise<string>>();

    /** The library of a pet type (0 dog, 1 cat...), null if it can't be loaded. */
    loadLibrary(typeId: number): Promise<PetLibrary | null> {
        const name = petLibraryName(typeId);
        if (!name) return Promise.resolve(null);

        let library = this.libraries.get(name);
        if (!library) {
            library = this.downloadLibrary(name);
            this.libraries.set(name, library);

            // e.g. the server of the assets was down: tried again the next time
            library.then(result => {
                if (!result) this.libraries.delete(name);
            });
        }

        return library;
    }

    /** A pet drawn with its figure ("<type> <palette> <color>..." or a PetFigureData), null without its library. */
    async createPet(figure: PetFigureData | string): Promise<Pet | null> {
        const data = typeof figure === 'string' ? PetFigureData.fromString(figure) : figure;
        const library = await this.loadLibrary(data.typeId);

        return library ? new Pet(library, data) : null;
    }

    /** An image (data url) of the pet, trimmed: cached by figure and options. '' if it can't be drawn. */
    getImage(figure: PetFigureData | string, options: PetImageOptions = {}): Promise<string> {
        const data = typeof figure === 'string' ? PetFigureData.fromString(figure) : figure;
        const direction = options.direction ?? 2;
        const key = [data.figureString, direction, options.headOnly ? 'head' : 'full', options.posture ?? '', options.gesture ?? ''].join('|');

        let image = this.images.get(key);
        if (!image) {
            image = this.drawImage(options.headOnly ? data.withHeadOnly() : data, direction, options).catch(e => {
                Logger.error('[Pet] image of ' + data.figureString + ': ' + e);
                return '';
            });
            this.images.set(key, image);

            image.then(result => {
                if (!result) this.images.delete(key);
            });
        }

        return image;
    }

    private async drawImage(figure: PetFigureData, direction: number, options: PetImageOptions): Promise<string> {
        const pet = await this.createPet(figure);
        if (!pet) return '';

        try {
            pet.setDirection(direction);
            pet.setShadow(false);
            if (options.posture) pet.setPosture(options.posture);
            if (options.gesture) pet.setGesture(options.gesture);

            // at density 1 (see UiUtils): as big as on a normal screen
            const canvas = UiUtils.generateCanvasFromObject(pet.container) as HTMLCanvasElement;
            return UiUtils.trimCanvas(canvas).toDataURL();
        } finally {
            pet.destroy();
        }
    }

    private async downloadLibrary(name: string): Promise<PetLibrary | null> {
        const base = PetImager.resourcesUrl() + name + '/' + name;

        try {
            const [data, image, atlas] = await Promise.all([
                fetchJsonAsync<NitroPetLibrary>(base + '.json'),
                PetImager.loadImage(base + '.png'),
                // the frames of the png: without the atlas the ones of the json, if they are right
                fetch(base + '.atlas').then(response => (response.ok ? response.text() : '')).catch(() => ''),
            ]);
            if (!data) return null;

            return new PetLibrary(data, image, atlas ? PetLibrary.parseAtlas(atlas) : null);
        } catch (e) {
            Logger.error('[Pet] unable to load the library ' + name + ': ' + e);
            return null;
        }
    }

    /** The image as it is (not a WebGL texture): the palettes read its pixels. */
    private static loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('image not loaded: ' + url));
            image.src = url;
        });
    }

    /** pet/ next to furniture/ in the Nitro assets, unless the configuration has its own. */
    private static resourcesUrl(): string {
        const config = Engine.getInstance()?.config as {proxyUrl?: string; petResourcesUrl?: string; itemsResourcesUrl?: string};
        const url = config?.petResourcesUrl ?? (config?.itemsResourcesUrl ?? '').replace(/furniture\/?$/, 'pet/');

        return (config?.proxyUrl ?? '') + (url.endsWith('/') ? url : url + '/');
    }
}
