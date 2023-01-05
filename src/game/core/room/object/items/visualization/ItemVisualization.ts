import { DisplayObject } from "pixi.js";
import { Engine } from "../../../../../Engine";
import Item from "../../../../../engine/room/objects/items/Item";
import MapData from "../../../../../engine/room/objects/map/MapData";
import { Tile } from "../../../../../engine/room/objects/map/Tile";
import AvatarData from "../../../../../engine/ui/imagers/avatars/enum/AvatarData";
import { FurniSprite } from "../../../../../engine/ui/imagers/items/FurniSprite";
import Point from "../../../../../utils/point/Point";
import Point3d from "../../../../../utils/point/Point3d";
import UiUtils from "../../../../../utils/UiUtils";
import { EntityVisualization } from "../../entities/EntityVisualization";
import { IRoomObjectVisualization } from '../../IRoomObjectVisualization';
import RoomObjectVisualization from '../../RoomObjectVisualization';

export default abstract class ItemVisualization extends EntityVisualization {
    private position: Point3d;

    public imagePreview: string | undefined;

    public iconImage: string | undefined;

    public isIcon: boolean = false;

    declare public _entity: Item

    constructor(item: Item) {
        super(item);

        this.position = item.position
        this.iconImage = this.generateIcon();
    }

    public nextFrame(): void {
        throw new Error("Method not implemented.");
    }
    
    public draw(): void {
        
    }

    public generateImages() {
        this.entity.visualization.container.on("furni-sprite-created", () =>{
            this.imagePreview = UiUtils.generateBase64FromObject(this.entity.visualization.container)
        })

        if(this.isIcon) {
            let icon = this._entity.base.turnIntoIcon();
        
            setTimeout(() => {
                this.iconImage = UiUtils.generateBase64FromObject(icon);
            }, 2000);
        }
    }

    public turnIntoIcon() {
        let icon = this._entity.base.turnIntoIcon();
        this.entity.visualization.container = icon;
        this.needsUpdate = false;
        this.isIcon = true;
    }

    public restore() {
        this.entity.visualization.container = this._entity.base.restore();
        this.needsUpdate = false;
        this.isIcon = false;
    }

    private generateImagePreview() {
        return UiUtils.generateBase64FromObject(this.entity.visualization.container);
    }

    private generateIcon(): string | undefined{
        //let icon: FurniSprite = this.entity.visualization.container.turnIntoIcon()
        //this.entity.visualization.container.restore()
        //return UiUtils.generateBase64FromObject(icon);
        return ""
    }

    public render(): void {
        this.entity.visualization.offsetX = this.calculateOffsetX()
        this.entity.visualization.offsetY = this.calculateOffsetY()
        this.entity.logic?.registerEvents();
    }

    public calculateOffsetX(): number {
        let currentRoom = Engine.getInstance().roomService?.CurrentRoom
        let tile: Tile = currentRoom.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this.position.getX()), Math.round(this.position.getY())))

        return (((tile!.position.getY() - tile!.position.getX()) * MapData.tileWidth / 2) + (MapData.tileWidth / 2))
    }

    public calculateOffsetY(): number {
        let currentRoom = Engine.getInstance().roomService?.CurrentRoom
        let tile: Tile = currentRoom.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this.position.getX()), Math.round(this.position.getY())))

        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -AvatarData.AVATAR_TOP_OFFSET;
        
        return ((tile!.position.getY() + tile!.position.getX()) * MapData.tileHeight / 2 + MapData.tileHeight / 2) + offsetFloor;
    }

    public getZIndex(): number {
        return 1 + this.entity.position.getX() + this.entity.position.getY()+ ((this.entity.position.getX() + this.entity.position.getY()) * 1000) + this.entity.position.getZ ()
    }
}