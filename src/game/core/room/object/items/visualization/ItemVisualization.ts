import { DisplayObject } from "pixi.js";
import { Engine } from "../../../../../Engine";
import Item from "../../../../../engine/room/objects/items/Item";
import MapData from "../../../../../engine/room/objects/map/MapData";
import Tile from "../../../../../engine/room/objects/map/Tile";
import RoomVisualization from "../../../../../engine/room/visualization/RoomVisualization";
import AvatarData from "../../../../../engine/ui/imagers/avatars/enum/AvatarData";
import { FurniSprite } from "../../../../../engine/ui/imagers/items/FurniSprite";
import Point from "../../../../../utils/point/Point";
import Point3d from "../../../../../utils/point/Point3d";
import UiUtils from "../../../../../utils/UiUtils";
import RoomObjectVisualization from "../../RoomObjectVisualization";

export default abstract class ItemVisualization extends RoomObjectVisualization {

    protected item: Item;

    private position: Point3d;

    public imagePreview: string | undefined;

    public iconImage: string | undefined;

    public nextY: number = 0;
    public nextX: number = 0;
    public nextZ: number = 0;

    public isIcon: boolean = false;

    constructor(item: Item) {
        super(0, 0, 0);

        this.item = item;
        this.position = item.position
        this.iconImage = this.generateIcon();
    }

    public updatePosition() {

        let currentRoom = Engine.getInstance().roomService?.CurrentRoom;
        
        let tile: Tile | undefined = currentRoom?.getRoomLayout().getFloorPlane().getTilebyPosition(new Point(Math.round(this.position.getX()), Math.round(this.position.getY()))); // get the tile where you want to set avatar
        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -AvatarData.AVATAR_TOP_OFFSET;


        this.item.base.x = (((tile!.position.getY() - tile!.position.getX()) * MapData.tileWidth / 2) + (MapData.tileWidth / 2))
        this.item.base.y = ((tile!.position.getY() + tile!.position.getX()) * MapData.tileHeight / 2 + MapData.tileHeight / 2) + offsetFloor;
        this.item.base.zIndex = this.getZIndex();
     
        for(let children of this.item.base.children) {
            children as DisplayObject

            children.zIndex = 1 + this.item.position.getX() + this.item.position.getY() + ((this.item.position.getX() + this.item.position.getY()) * 1000) + this.item.position.getZ() + 5;
        
        }

        (currentRoom?.getRoomLayout().Visualization as RoomVisualization).Container.addChild(this.item.base)

    
        this.item.base.buttonMode = true;
        this.item.base.interactive = true;
        this.item.base.interactiveChildren = true;
        
        this.generateImages();

    }

    public generateImages() {
        this.item.base.on("furni-sprite-created", () =>{
            this.imagePreview = UiUtils.generateBase64FromObject(this.item.base)
        })

        if(this.isIcon) {
            let icon = this.item.base.turnIntoIcon();
        
            setTimeout(() => {
                this.iconImage = UiUtils.generateBase64FromObject(icon);
            }, 2000);
        }
    }

    public turnIntoIcon() {
        let icon = this.item.base.turnIntoIcon();
        this.item.base = icon;
        this.needsUpdate = false;
        this.isIcon = true;
    }

    public restore() {
        this.item.base = this.item.base.restore();
        this.needsUpdate = false;
        this.isIcon = false;
    }

    public move(delta: number): void {
        delta = delta / 1000;
 
        if (this.item.position.getX() < this.nextX) {
            this.item.position.setX(this.item.position.getX() + delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.item.position.getX() > this.nextX) {
                //this.isWalking = false;
                this.item.position.setX(this.nextX);
            }
        } else if (this.item.position.getX() > this.nextX) {
            this.item.position.setX(this.item.position.getX() - delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.item.position.getX() < this.nextX) {
                //this.isWalking = false;
                this.item.position.setX(this.nextX);
            }
        }

        if (this.item.position.getY() < this.nextY) {
            this.item.position.setY(this.item.position.getY() + delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.item.position.getY() > this.nextY) {
                //this.isWalking = false;
                this.item.position.setY(this.nextY);
            }
        } else if (this.item.position.getY() > this.nextY) {
            this.item.position.setY(this.item.position.getY() - delta * AvatarData.AVATAR_WALK_SPEED);
            if (this.item.position.getY() < this.nextY) {
                //this.isWalking = false;
                this.item.position.setY(this.nextY);
            }
        }

        if (this.nextZ > this.item.position.getZ()) {
            this.item.position.setZ(this.item.position.getZ() + ((Math.abs(this.item.position.getZ() - this.nextZ) > 1.5) ? 9.8 : AvatarData.AVATAR_WALK_SPEED) * delta);
            if (this.item.position.getZ() > this.nextZ) {
                this.item.position.setZ(this.nextZ);
            }
        } else if (this.nextZ < this.item.position.getZ()) {
            this.item.position.setZ(this.item.position.getZ() - ((Math.abs(this.item.position.getZ() - this.nextZ) > 1.5) ? 9.8 : AvatarData.AVATAR_WALK_SPEED) * delta);
            if (this.item.position.getZ() < this.nextZ) {
                this.item.position.setZ(this.nextZ);
            }
        }

        this.updatePosition()
    }

    private generateImagePreview() {
        return UiUtils.generateBase64FromObject(this.item.base);
    }
    private generateIcon(): string | undefined{
        let icon: FurniSprite = this.item.base.turnIntoIcon()
        this.item.base.restore()
        return UiUtils.generateBase64FromObject(icon);
    }

    public render(): void {
        this.item.logic?.registerEvents();
    }

    public getItem() : Item {
        return this.item;
    }

    public getVisualizationType() : string  {
        return this.item.base.furniBase.visualizationType;
    }

    public getOffsetX(): number {
        throw new Error("Method not implemented.");
    }
    public getOffsetY(): number {
        throw new Error("Method not implemented.");
    }
    public getZIndex(): number {
        return 1 + this.item.position.getX() + this.item.position.getY()+ ((this.item.position.getX() + this.item.position.getY()) * 1000) + this.item.position.getZ ()
    }

}