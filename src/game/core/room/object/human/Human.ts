import {Entity} from '../entities/Entity';

export class Human extends Entity {
    protected _figure: string;

    constructor(id: string, name: string, figure: string) {
        super(id, name);

        this._figure = figure;
    }

    get figure() {
        return this._figure;
    }
}
