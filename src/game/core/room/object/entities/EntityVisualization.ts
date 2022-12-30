import { Direction } from "../../../objects/Direction";
import RoomObjectVisualization from "../RoomObjectVisualization";
import Entity from "./Entity";
import { ActionId } from "../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import { Container } from "pixi.js";

export default abstract class EntityVisualization extends RoomObjectVisualization {

    protected entity: Entity;

    public container: Container | null = null

    protected rotation: Direction = Direction.SOUTH;
    protected headDirection: Direction = Direction.SOUTH;

    protected isWalking: boolean = false;
    protected isDancing: boolean = false;
    protected isTyping: boolean = false;

    public actions: Set<ActionId>;

    public inRoom: boolean = false;

    public nextY: number = 0;
    public nextX: number = 0;
    public nextZ: number = 0;

    public frame: number = 0;


    public constructor(entity: Entity) {
        super(0, 0, 0);
        this.entity = entity;
        this.actions = new Set();
    }


    public abstract draw(): void

    public abstract nextFrame(): void

    public abstract updateFrame(frame: number): void

    public addAction(action: ActionId) {
        this.removeActions([ActionId.STAND, ActionId.WALK, ActionId.SIT, ActionId.LAY])
        this.actions.add(action);

    }

    public removeAction(action: ActionId) {
        this.actions.delete(action)
    }
    public removeActions(actions: ActionId[]) {
        for(let action of actions) {
            this.removeAction(action)
        }
    }

    public setDirection(direction: Direction) {
        this.rotation = direction; 
    }

    public get Entity(): Entity { return this.entity; }


    public get Actions(): Set<ActionId> {
        return this.actions
    }

    public get IsInRoom(): boolean {
        return this.inRoom;
    }

    public set InRoom(value: boolean) {
        this.inRoom = value;
    }

    public set IsWalking(value: boolean) {
        this.isWalking = value;
    }
    public get IsWalking(): boolean {
        return this.isWalking;
    }

    public set Rot(direction: Direction) {
        this.rotation = direction;
    }
    public set HeadRot(direction: Direction) {
        this.headDirection = direction;
    }

    public get IsTyping(): boolean {
        return this.isTyping
    }

    public set IsDancing(value: boolean) {
        this.isDancing = value;
    }

    public get IsDancing(): boolean {
        return this.isDancing;
    }

    public set NextX(x: number) {
        this.nextX = x;
    }
    public set NextY(y: number) {
        this.nextY = y;
    }
    public set NextZ(z: number) {
        this.nextZ = z;
    }
}