import RoomObjectLogic from "../RoomObjectLogic";
import Entity from "./Entity";

export default abstract class EntityLogic extends RoomObjectLogic {

    protected entity: Entity;
    public frameTracker: number = 0;

    public constructor(entity: Entity) {
        super();
        this.entity = entity;
    }

    public abstract onPositionChanged(): void

    public abstract onDance(): void

    public abstract onTalk(): void

    public get Entity(): Entity { return this.entity; }
}