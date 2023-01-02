import RoomEntityVisualization from "../../../../../../core/room/object/entities/EntityVisualization";
import Point3d from "../../../../../../utils/point/Point3d";
import Avatar from "../../../../../ui/imagers/avatars/Avatar";
import { Direction } from "../../../../../../core/objects/Direction";
import AvatarData from "../../../../../ui/imagers/avatars/enum/AvatarData";
import MapData from "../../../map/MapData";
import Tile from "../../../map/Tile";
import UserEntity from "../UserEntity";
import Point from "../../../../../../utils/point/Point";
import UserEntityLogic from "../logic/UserEntityLogic";
import Rotation from "../../../../../../utils/Rotation";
import { Engine } from "../../../../../../Engine";
import AvatarPlaceHolder from "../../../../../ui/imagers/avatars/AvatarPlaceholder";

export default class UserEntityVisualization extends RoomEntityVisualization {
    declare public entity: UserEntity;
    private avatar: Avatar | null = null;

    constructor(entity: UserEntity) {
        super(entity)
        this.entity = entity
    }

    public render(): void {

     
        let avatar = new Avatar(this.entity.Look, this.rotation, this.rotation, this.actions);
        
        this.avatar = avatar;

        Engine.getInstance().userInterfaceManager?.avatarImager.loadAvatar(this.avatar!).then(() => {
            Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(this.avatar!)
        });

        this.avatar.Container.buttonMode = true;
        this.avatar.Container.interactive = true;
        this.avatar.Container.interactiveChildren = true;

        this.avatar.Container.zIndex = 10

        this.container = this.avatar.Container;
        
        (this.entity.logic as UserEntityLogic).registerEvents();
      
        if(Engine.getInstance().roomService?.CurrentRoom) {
            (Engine.getInstance().roomService?.CurrentRoom?.getRoomLayout().Visualization.container?.addChild(avatar.Container));
            this.updatePosition(); //todo needs to be refactored 
            this.container?.emit("user-position-changed", 200);
        }

    }
    public updateFrame(frame: number): void {
        this.frame = frame;
    }
    public nextFrame(): void {
        if(this.frame > this.avatar!.Frames) {
            this.frame = 0;
        } else {
            this.frame++;
        }
    }
    public draw(): void {
        this.container!.destroy();
        this.updateDirection(this.rotation);
        let avatar = new Avatar(this.entity.Look, this.rotation, this.rotation, this.actions, this.frame);
        Engine.getInstance().userInterfaceManager?.avatarImager.drawAvatar(avatar);
        this.avatar = avatar;

        this.container = this.avatar.Container;

        this.container!.zIndex = this.getZIndex();

        if(Engine.getInstance().roomService?.CurrentRoom) {
            (Engine.getInstance().roomService?.CurrentRoom?.getRoomLayout().Visualization.container?.addChild(this.container!));
        }

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



    public setPosition(point: Point3d)  {
        //console.log(this.headDirection);
        this.nextX = point.getX();
        this.nextY = point.getY();
        this.nextZ = point.getZ();
        this.rotation = Rotation.calculateDirection(new Point(point.getX(), point.getY()), new Point(this.entity.position.getX(), this.entity.position.getY()), this.rotation);
        this.headDirection = Rotation.calculateDirection(new Point(point.getX(), point.getY()), new Point(this.entity.position.getX(), this.entity.position.getY()), this.rotation);
        this.updatePosition()
        this.draw();
        this.container?.emit("user-position.changed");
        
    }

    public updatePosition() {
        const currentRoom = Engine.getInstance().roomService?.CurrentRoom; // current user room

        let tile: Tile | null = currentRoom?.getRoomLayout().getFloorPlane().getTilebyPosition(new Point(Math.round(this.entity.position.getX()), Math.round(this.entity.position.getY()))); // get the tile where you want to set avatar

        if(tile == null) return;

        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -AvatarData.AVATAR_TOP_OFFSET;

        this.container!.x = (((this.entity.position.getY() - this.entity.position.getX()) * MapData.tileWidth / 2) + (MapData.tileWidth / 2)) - MapData.tileWidth / 2
        this.container!.y = ((this.entity.position.getX() + this.entity.position.getY()) * MapData.tileHeight / 2) + (MapData.tileHeight / 2) + offsetFloor;
        this.container!.zIndex = this.getZIndex();

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

    public get Avatar(): Avatar | null{
        return this.avatar;
    }
    
    public getZIndex(): number {

        if(this.entity.position.getX() === Engine.getInstance().roomService?.CurrentRoom?.getRoomLayout().getDoorPosition().getX() && this.entity.position.getY() === Engine.getInstance().roomService?.CurrentRoom?.getRoomLayout().getDoorPosition().getY()) {
            return 3;
        }

        return (1 + Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY()) + ((Math.round(this.entity.position.getX()) + Math.round(this.entity.position.getY())) * 1000) + 4);
    }
    
}