import {Container} from 'pixi.js';
import Point from '../../../../../utils/point/Point';

export default class AvatarImageContainer {
    public imageContainer: Container;

    private offsets: Point;

    public constructor(image: Container) {
        this.imageContainer = image;

        this.offsets = new Point(0, 0);
    }

    public get image(): Container {
        return this.imageContainer;
    }
}
