import Room from "../../../../engine/room/Room";
import { Entity } from "../entities/Entity";

export default class Human extends Entity {

    protected _figure: string

    public constructor(id: string, name: string, figure: string) {
        super(id, name);

        this._figure = figure;
    }

    public get figure() {
        return this._figure
    }
}