import { Engine } from "../../../../../Engine";
import MapData from "../../../../../engine/room/objects/map/MapData";
import { Tile } from "../../../../../engine/room/objects/map/Tile";
import Avatar from "../../../../../engine/ui/imagers/avatars/Avatar";
import AvatarPlaceHolder from "../../../../../engine/ui/imagers/avatars/AvatarPlaceholder";
import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import AvatarData from "../../../../../engine/ui/imagers/avatars/enum/AvatarData";
import Point from "../../../../../utils/point/Point";
import Point3d from "../../../../../utils/point/Point3d";
import Rotation from "../../../../../utils/Rotation";
import { Direction } from "../../../../objects/Direction";
import { EntityVisualization } from "../../entities/EntityVisualization";
import Human from "../Human";

export abstract class HumanVisualization extends EntityVisualization {

    protected _actions: Set<ActionId>;

    protected _avatar: Avatar

    public _entity: Human | null = null

    protected _headDirection: Direction = Direction.SOUTH

    public constructor(human: Human) {
        super(human)

        this._entity = human;

        this._actions = new Set();
    }

    public setPosition(point: Point3d): void {
        super.setPosition(point)
        this.headRotation = Rotation.calculateDirection(new Point(this.entity.position.getX(), this._entity.position.getY()), new Point(this.entity.position.getX(), this.entity.position.getY()));
    }

    public async loadAvatar(): Promise<void> {
        return new Promise((resolve, reject) => {
            let avatar = new Avatar(this._entity.figure, this.rotation, this.rotation, this._actions, this.frame)

            Engine.getInstance()?.userInterfaceManager?.avatarImager.loadAvatar(avatar).then(() => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    }

    public set headRotation(direction: Direction) {
        this._headDirection = direction;
    }

    public addAction(action: ActionId): void {
        this.removeActions([ActionId.STAND, ActionId.WALK, ActionId.SIT, ActionId.LAY])
        this._actions.add(action);
    }

    public removeAction(action: ActionId): void {
        this._actions.delete(action)
    }
    public removeActions(actions: ActionId[]) {
        for (let action of actions) {
            this.removeAction(action)
        }
    }

    public updateDirection(direction: Direction) {
        let avatar = this._avatar;
        this.container!.removeChildren();
        avatar!.Direction = direction;
    }

    public async draw(): Promise<void> {
        this.container.destroy({
            texture: true,
            baseTexture: true
        })

        this._avatar = new Avatar(this._entity.figure, this.rotation, this.rotation, this._actions, this.frame)

        Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(this._avatar);

        this.container = this._avatar.Container

        this.container!.zIndex = 10

        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
            this.updatePosition()
        }

        this.container.interactive = true

        this.entity.logic.registerEvents()
    }

    public async render(): Promise<void> {
        let placeholder = new AvatarPlaceHolder("", this.rotation, this.rotation, this._actions, 0, 0);

        this._avatar = placeholder

        Engine.getInstance()?.userInterfaceManager?.avatarImager.loadAvatar(placeholder).then(() => {
            Engine.getInstance()?.userInterfaceManager?.avatarImager.drawAvatar(placeholder)
        });

        placeholder.Container.buttonMode = true;
        placeholder.Container.interactive = true;
        placeholder.Container.interactiveChildren = true;

        this.container = placeholder.Container;

        this.loadAvatar().then(() => {
            this.container.destroy()
            this.draw()
        });

        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
            this.updatePosition();
        }
    }

    public nextFrame(): void {
        if (this.frame > this._avatar.Frames) {
            this.frame = 0;
        } else {
            this.frame++;
        }
    }

    public calculateOffsetY() {
        let tile: Tile = Engine.getInstance().roomService.CurrentRoom.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this._entity.position.getX()), Math.round(this.entity.position.getY())))
        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -AvatarData.AVATAR_TOP_OFFSET;

        return this.container!.y = ((this.entity.position.getX() + this.entity.position.getY()) * MapData.tileHeight / 2) + (MapData.tileHeight / 2) + offsetFloor;
    }

    public calculateOffsetX() {
        return (((this.entity.position.getY() - this.entity.position.getX()) * MapData.tileWidth / 2) + (MapData.tileWidth / 2)) - MapData.tileWidth / 2
    }

    public get actions() {
        return this._actions
    }
}