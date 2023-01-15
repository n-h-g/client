import { DisplayObject } from "pixi.js";
import { Engine } from "../../../../../Engine";
import { EntityEvents } from "../../../../../engine/events/room/objects/entities/EntityEvents";
import { ItemEvents } from "../../../../../engine/events/room/objects/entities/ItemEvents";
import Item from "../../../../../engine/room/objects/items/Item";
import MapData from "../../../../../engine/room/objects/map/MapData";
import { Tile } from "../../../../../engine/room/objects/map/Tile";
import { RoomPriority } from "../../../../../engine/room/visualization/RoomPriority";
import RoomVisualization from "../../../../../engine/room/visualization/RoomVisualization";
import AvatarData from "../../../../../engine/ui/imagers/avatars/enum/AvatarData";
import { ItemType } from "../../../../../engine/ui/imagers/items/FurniImager";
import { FurniSprite } from "../../../../../engine/ui/imagers/items/FurniSprite";
import Point from "../../../../../utils/point/Point";
import Point3d from "../../../../../utils/point/Point3d";
import UiUtils from "../../../../../utils/UiUtils";
import { EntityVisualization } from "../../entities/EntityVisualization";
import { IRoomObjectVisualization } from '../../IRoomObjectVisualization';
import RoomObjectVisualization from '../../RoomObjectVisualization';

export default abstract class ItemVisualization extends EntityVisualization {
    private position: Point3d;

    public iconImage: string | undefined;

    public isIcon: boolean = false;

    declare public _entity: Item

    private sprite: FurniSprite

    constructor(item: Item) {
        super(item);
        this.position = item.position
        this.iconImage = this.generateIcon();
    }


    public nextFrame(): void {
        throw new Error("Method not implemented.");
    }
    
    public draw(): void {
        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
            this.updatePosition()
        }
    }

    public generateImages() {

        if(this.isIcon) {
            let icon = this.sprite.turnIntoIcon();
        
            setTimeout(() => {
                this.iconImage = UiUtils.generateBase64FromObject(icon);
            }, 2000);
        }
    }

    public turnIntoIcon() {
        let icon = this.sprite.turnIntoIcon();
        this.entity.visualization.container = icon;
        this.needsUpdate = false;
        this.isIcon = true;
    }

    public restore() {
        this.entity.visualization.container = this.container
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

    public async render(): Promise<void> {

        try {
            let sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniSprite(ItemType.FloorItem, this.entity.name)
        
            sprite.start()

            let dir = sprite.getNextDirection(this.rotation)

            this.rotation = dir

            sprite.setDirection(dir)

            this.container = sprite

        } catch(e) {
            //this.container = await Engine.getInstance().userInterfaceManager.furniImager.loadPlaceHolder()
            throw new Error(e)
        }

        let spriteZIndex = this._entity.base.data.logic.dimensions[2]
        
        this.container.zIndex = this.getZIndex(spriteZIndex)

        this.container.interactive = true
        this.container.interactiveChildren = true

        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
            this.updatePosition()
        }

        this.entity.logic?.registerEvents();

        await this.entity.logic.onLoad()

        this.entity.logic?.events.emit(ItemEvents.FURNI_SPRITE_LOADED)
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

    public getZIndex(zIndex: number = 1): number {
        const compareY = (Math.trunc(zIndex / 100)) / 10;
        return RoomVisualization.calculateZIndex(new Point3d(this.entity.position.getX(), this.entity.position.getY() + compareY, this.entity.position.getZ()), RoomPriority.ROOM_ITEM);
    }
}