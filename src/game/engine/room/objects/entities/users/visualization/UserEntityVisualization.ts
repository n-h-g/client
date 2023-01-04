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

export default class UserEntityVisualization extends EntityVisualization {
    declare public entity: UserEntity;
    private avatar: Avatar | null = null;

    private avatarCache: Avatar | null = null;

    constructor(entity: UserEntity) {
        super(entity)
        this.entity = entity
    }
    
    public async loadAvatar(): Promise<Avatar> {
        return new Promise((resolve, reject) => {
            let avatar = new Avatar(this.entity.Look, this.rotation, this.rotation, this.actions, this.frame)

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

    public updateFrame(frame: number): void {
        this.frame = frame;
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
        
        this.avatar = new Avatar(this.entity.Look, this.rotation, this.rotation, this.actions, this.frame)

        Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(this.avatar);

        this.container = this.avatar.Container

        this.container!.zIndex = 10

        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
        }

        this.entity.logic.registerEvents()

        this.updatePosition();
    }

    public talk(): void {

    }

    public move(delta: number): void {
        delta = delta / 1000;
        
        if (this.entity.position.getX() < this.nextX) {
            this.entity.position.setX(this.entity.position.getX() + delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.entity.position.getX() > this.nextX) {
                //this.isWalking = false;
                this.entity.position.setX(this.nextX);
            }
        } else if (this.entity.position.getX() > this.nextX) {
            this.entity.position.setX(this.entity.position.getX() - delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.entity.position.getX() < this.nextX) {
                //this.isWalking = false;
                this.entity.position.setX(this.nextX);
            }
        }

        if (this.entity.position.getY() < this.nextY) {
            this.entity.position.setY(this.entity.position.getY() + delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.entity.position.getY() > this.nextY) {
                //this.isWalking = false;
                this.entity.position.setY(this.nextY);
            }
        } else if (this.entity.position.getY() > this.nextY) {
            this.entity.position.setY(this.entity.position.getY() - delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.entity.position.getY() < this.nextY) {
                //this.isWalking = false;
                this.entity.position.setY(this.nextY);
            }
        }

        if (this.nextZ > this.entity.position.getZ()) {
            this.entity.position.setZ(this.entity.position.getZ() + ((Math.abs(this.entity.position.getZ() - this.nextZ) > 1.5) ? 9.8 : AvatarData.AVATAR_WALK_SPEED) * delta);
            if (this.entity.position.getZ() > this.nextZ) {
                this.entity.position.setZ(this.nextZ);
            }
        } else if (this.nextZ < this.entity.position.getZ()) {
            this.entity.position.setZ(this.entity.position.getZ() - ((Math.abs(this.entity.position.getZ() - this.nextZ) > 1.5) ? 9.8 : AvatarData.AVATAR_WALK_SPEED) * delta);
            if (this.entity.position.getZ() < this.nextZ) {
                this.entity.position.setZ(this.nextZ);
            }
        }

        this.updatePosition()
    }

    public setPosition(point: Point3d) {
        this.nextX = point.getX();
        this.nextY = point.getY();
        this.nextZ = point.getZ();
        this.rotation = Rotation.calculateDirection(new Point(point.getX(), point.getY()), new Point(this.entity.position.getX(), this.entity.position.getY()));
        this.headDirection = Rotation.calculateDirection(new Point(point.getX(), point.getY()), new Point(this.entity.position.getX(), this.entity.position.getY()));
        this.updatePosition()
        this.container?.emit("user-position-changed");
    }

    public updatePosition() {
        const currentRoom = Engine.getInstance().roomService?.CurrentRoom; // current user room

        let tile: Tile = currentRoom?.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this.entity.position.getX()), Math.round(this.entity.position.getY()))); // get the tile where you want to set avatar

        if (tile == null) return;

        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -AvatarData.AVATAR_TOP_OFFSET;

        this.container!.x = (((this.entity.position.getY() - this.entity.position.getX()) * MapData.tileWidth / 2) + (MapData.tileWidth / 2)) - MapData.tileWidth / 2
        this.container!.y = ((this.entity.position.getX() + this.entity.position.getY()) * MapData.tileHeight / 2) + (MapData.tileHeight / 2) + offsetFloor;
        this.container!.zIndex = 10

        this.container!.buttonMode = true;
        this.container!.interactive = true;
        this.container!.interactiveChildren = true;
        this.entity.logic.registerEvents()
    }

    public updateDirection(direction: Direction) {
        let avatar = this.avatar;
        this.container!.removeChildren();
        avatar!.Direction = direction;
    }

    public get Avatar(): Avatar | null {
        return this.avatar;
    }

    public getZIndex(): number {

        if (this.entity.position.getX() === Engine.getInstance().roomService?.CurrentRoom?.roomLayout.getDoorPosition().getX() && this.entity.position.getY() === Engine.getInstance().roomService?.CurrentRoom?.roomLayout.getDoorPosition().getY()) {
            return 3;
        }

        return (1 + Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY()) + ((Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY())) * 1000) + 4);
    }
}