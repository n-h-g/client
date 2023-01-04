import Point3d from "../../../../../../utils/point/Point3d";
import Avatar from "../../../../../ui/imagers/avatars/Avatar";
import { Direction } from "../../../../../../core/objects/Direction";
import AvatarData from "../../../../../ui/imagers/avatars/enum/AvatarData";
import MapData from "../../../map/MapData";
import Point from "../../../../../../utils/point/Point";
import UserEntityLogic from "../logic/UserEntityLogic";
import Rotation from "../../../../../../utils/Rotation";
import { Engine } from "../../../../../../Engine";
import AvatarPlaceHolder from "../../../../../ui/imagers/avatars/AvatarPlaceholder";
import { EntityVisualization } from '../../../../../../core/room/object/entities/EntityVisualization';
import { UserEntity } from '../UserEntity';
import { Tile } from '../../../map/Tile';
import { ActionId } from "../../../../../ui/imagers/avatars/enum/actions/ActionId";

export default class UserEntityVisualization extends EntityVisualization {
    private avatar: Avatar | null = null;

    private avatarCache: Avatar | null = null;

    public _actions: Set<ActionId>

    declare public _entity: UserEntity

    constructor(entity: UserEntity) {
        super(entity)
        this._entity = entity as UserEntity
        this._actions = new Set();
    }

    public async loadAvatar(): Promise<Avatar> {
        return new Promise((resolve, reject) => {
            let avatar = new Avatar(this._entity.Look, this.rotation, this.rotation, this.actions, this.frame)

            Engine.getInstance()?.userInterfaceManager?.avatarImager.loadAvatar(avatar).then(async () => {
                await Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(avatar)
                this.avatarCache = avatar
                resolve(avatar)
            }).catch(() => {
                reject()
            })
        })
    }

    public async render(): Promise<void> {
        let placeholder = new AvatarPlaceHolder("", this.rotation, this.rotation, this.actions);

        Engine.getInstance()?.userInterfaceManager?.avatarImager.loadAvatar(placeholder).then(() => {
            Engine.getInstance()?.userInterfaceManager?.avatarImager.drawAvatar(placeholder)
        });

        this.avatar = placeholder

        this.avatar.Container.buttonMode = true;
        this.avatar.Container.interactive = true;
        this.avatar.Container.interactiveChildren = true;

        this.container = this.avatar.Container;

        this.loadAvatar().then((avatar: Avatar) => {
            this.avatar = avatar
            this.container.destroy()
            this.draw()
        });

        (this.entity.logic as UserEntityLogic).registerEvents();
        
        if(Engine.getInstance().roomService?.CurrentRoom) {
            (Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container));
            this.updatePosition(); //todo needs to be refactored 
            this.container?.emit("user-position-changed", 200);
        }
    }

    public nextFrame(): void {
        if (this.frame > this.avatar!.Frames) {
            this.frame = 0;
        } else {
            this.frame++;
        }
    }

    public async draw(): Promise<void> {

        this.container.destroy()
        
        this.avatar = new Avatar(this._entity.Look, this.rotation, this.rotation, this.actions, this.frame)

        Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(this.avatar);

        this.container = this.avatar.Container

        this.container!.zIndex = 10

        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
        }

        this.entity.logic.registerEvents()

        this.updatePosition();
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
        let avatar = this.avatar;
        this.container!.removeChildren();
        avatar!.Direction = direction;
    }

    public calculateOffsetY() {
        let tile: Tile = this._entity.room.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this._entity.position.getX()), Math.round(this.entity.position.getY())))
        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -AvatarData.AVATAR_TOP_OFFSET;


        return this.container!.y = ((this.entity.position.getX() + this.entity.position.getY()) * MapData.tileHeight / 2) + (MapData.tileHeight / 2) + offsetFloor;
    }

    public calculateOffsetX() {


        return (((this.entity.position.getY() - this.entity.position.getX()) * MapData.tileWidth / 2) + (MapData.tileWidth / 2)) - MapData.tileWidth / 2
    }

    public get Avatar(): Avatar | null {
        return this.avatar;
    }


    public get actions(): Set<ActionId> {
        return this._actions
    }
    

    public getZIndex(): number {

        if (this.entity.position.getX() === Engine.getInstance().roomService?.CurrentRoom?.roomLayout.getDoorPosition().getX() && this.entity.position.getY() === Engine.getInstance().roomService?.CurrentRoom?.roomLayout.getDoorPosition().getY()) {
            return 3;
        }

        return (1 + Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY()) + ((Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY())) * 1000) + 4);
    }
}