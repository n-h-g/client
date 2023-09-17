import {Entity} from '../entities/Entity';

export class Human extends Entity {
    readonly figure: string;

    constructor(id: string, name: string, figure: string) {
        super(id, name);

        this.figure = figure;
    }
}
