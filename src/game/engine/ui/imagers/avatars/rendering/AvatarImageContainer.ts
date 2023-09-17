import {Container} from 'pixi.js';
import {Point} from '../../../../../utils/point/Point';

export class AvatarImageContainer {
    imageContainer: Container;

    private offsets: Point;

    constructor(image: Container) {
        this.imageContainer = image;

        this.offsets = new Point(0, 0);
    }

    get image(): Container {
        return this.imageContainer;
    }
}
