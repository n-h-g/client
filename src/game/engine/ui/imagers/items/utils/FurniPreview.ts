import {Container, Graphics} from 'pixi.js';
import {Engine} from '../../../../../Engine';
import {UiUtils} from '../../../../../utils/UiUtils';
import {FurnidataItemType} from '../enum/FurniDataItemType';

/**
 * Image (base64) of a furni in its default direction, for the UI previews (catalogue, inventory).
 */
export class FurniPreview {
    /**
     * @param name the furni name, with the color variant (chair_plasto*2).
     * @param background the color of the panel showing the image: the layers with ink ADD (glows) are black
     *                   where they add nothing, on a transparent background they would leave a black box.
     */
    static async render(name: string, background = 0xffffff): Promise<string | null> {
        const furniImager = Engine.getInstance()?.userInterfaceManager?.furniImager;
        if (!furniImager) return null;

        const sprite = await furniImager.loadFurniSprite(FurnidataItemType.FloorItem, name);
        if (!sprite) return null;

        await sprite.init();
        sprite.setDirection(sprite.furniBase.getUIDirection());
        sprite.update(true);

        const bounds = sprite.container.getLocalBounds();
        const backgroundRect = new Graphics();
        backgroundRect.beginFill(background);
        backgroundRect.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
        backgroundRect.endFill();

        const scene = new Container();
        scene.addChild(backgroundRect, sprite.container);

        const image = await UiUtils.generateBase64FromObject(scene);
        scene.destroy({children: true});

        return image;
    }
}
