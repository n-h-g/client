import { Engine } from "../../../../../Engine";
import MapData from "../../../../../engine/room/objects/map/MapData";
import { Tile } from "../../../../../engine/room/objects/map/Tile";
import Avatar from "../../../../../engine/ui/imagers/avatars/Avatar";
import AvatarPlaceHolder from "../../../../../engine/ui/imagers/avatars/AvatarPlaceholder";
import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId";
import AvatarData from "../../../../../engine/ui/imagers/avatars/enum/AvatarData";
import Point from "../../../../../utils/point/Point";
import { Direction } from "../../../../objects/Direction";
import { EntityVisualization } from "../../entities/EntityVisualization";
import Human from "../Human";

export abstract class HumanVisualization extends EntityVisualization {

    protected _actions: Set<ActionId>;

    protected _avatar: Avatar

    public _entity: Human | null = null

    private _avatarCache: Avatar | null = null

    public constructor(human: Human) {
        super(human)

        this._entity = human;

        this._actions = new Set();
    }

    public async loadAvatar(): Promise<Avatar> {
        return new Promise((resolve, reject) => {
            let avatar = new Avatar(this._entity.figure, this.rotation, this.rotation, this._actions, this.frame)

            Engine.getInstance()?.userInterfaceManager?.avatarImager.loadAvatar(avatar).then(async () => {
                await Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(avatar)
                this._avatarCache = avatar
                resolve(avatar)
            }).catch(() => {
                reject()
            })
        })
    }

    public addAction(action: ActionId): void {
        this.removeActions([ActionId.STAND, ActionId.WALK, ActionId.SIT, ActionId.LAY])
        this._actions.add(action);
    }

    public removeAction(action: ActionId): void {
        this._actions.delete(action)
    }
    public removeActions(actions: ActionId[]) {
        for(let action of actions) {
            this.removeAction(action)
        }
    }

    public updateDirection(direction: Direction) {
        let avatar = this._avatar;
        this.container!.removeChildren();
        avatar!.Direction = direction;
    }

    
    public async draw(): Promise<void> {

        this._avatar.Container.destroy({
            texture: true,
            baseTexture: true
        })
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
        }

        this.entity.logic.registerEvents()

        this.updatePosition();
    }
    public async render(): Promise<void> {
        let placeholder = new AvatarPlaceHolder("", this.rotation, this.rotation, this._actions);

        Engine.getInstance()?.userInterfaceManager?.avatarImager.loadAvatar(placeholder).then(() => {
            Engine.getInstance()?.userInterfaceManager?.avatarImager.drawAvatar(placeholder)
        });

        this._avatar = placeholder

        this._avatar.Container.buttonMode = true;
        this._avatar.Container.interactive = true;
        this._avatar.Container.interactiveChildren = true;

        this.container = this._avatar.Container;

        this.loadAvatar().then((avatar: Avatar) => {
            this._avatar = avatar
            this.container.destroy()
            this.draw()
        });

        this._entity.logic.registerEvents()
        
        if(Engine.getInstance().roomService?.CurrentRoom) {
            (Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container));
            this.updatePosition(); //todo needs to be refactored 
            this.container?.emit("user-position-changed", 200);
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
        let tile: Tile = this._entity.room.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this._entity.position.getX()), Math.round(this.entity.position.getY())))
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