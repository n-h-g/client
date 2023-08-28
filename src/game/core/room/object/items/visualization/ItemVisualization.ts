import { Container } from 'pixi.js'
import { Engine } from '../../../../../Engine'
import { ItemEvents } from '../../../../../engine/events/room/objects/entities/ItemEvents'
import Item from '../../../../../engine/room/objects/items/Item'
import MapData from '../../../../../engine/room/objects/map/MapData'
import { Tile } from '../../../../../engine/room/objects/map/Tile'
import { RoomPriority } from '../../../../../engine/room/visualization/RoomPriority'
import RoomVisualization from '../../../../../engine/room/visualization/RoomVisualization'
import { Furni } from '../../../../../engine/ui/imagers/items/Furni'
import { FurniData } from '../../../../../engine/ui/imagers/items/FurniData'
import { Logger } from '../../../../../utils/Logger'
import Point from '../../../../../utils/point/Point'
import Point3d from '../../../../../utils/point/Point3d'
import UiUtils from '../../../../../utils/UiUtils'
import { EntityVisualization } from '../../entities/EntityVisualization'
import { MoveableVisualization } from '../../IMoveable'
import { FurnidataItemType } from '../../../../../engine/ui/imagers/items/enum/FurniDataItemType'

export default abstract class ItemVisualization extends EntityVisualization implements MoveableVisualization {
    
    protected position: Point3d

    protected iconImage: string

    protected imagePreview: string

    protected isIcon: boolean = false 

    protected sprite: Furni

    constructor(item: Item) {
        super(item)
        this.position = item.position
        this.iconImage = this.generateIcon()
        this.imagePreview = this.generateImagePreview()
    }

    public nextFrame(): void {
    
    }

    public draw(): void {
        if (Engine.getInstance().roomService?.CurrentRoom) {

            let temp: Container = this.sprite.container as Container;

            if(this.container) {
                this.sprite.reset()
            }

            this.sprite.update(true)

            this.container = temp;
    
            this.container.interactive = true

            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
            this.updatePosition()
            this.entity.logic.registerEvents()
        }
    }

    public generateImages() {
        /*if (this.isIcon) {
            let icon = this.sprite.turnIntoIcon()

            setTimeout(() => {
                this.iconImage = UiUtils.generateBase64FromObject(icon)
            }, 2000)
        }*/
    }

    public turnIntoIcon() {
        /*let icon = this.sprite.turnIntoIcon()
        this.entity.visualization.container = icon
        this.needsUpdate = false
        this.isIcon = true*/
    }

    public reset() {
        this.entity.visualization.container = this.container
        this.needsUpdate = false
        this.isIcon = false
    }

    private generateImagePreview() {
        return this.entity ? UiUtils.generateBase64FromObject(this.container) : null;
    }

    private generateIcon(): string {
        return '';
    }

    public async render(): Promise<void> {

        if(this.container) {
            this.container.removeChildren()
        }

        try {
            this.sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniSprite(FurnidataItemType.FloorItem, this.entity.name)

            await this.sprite.init()

            let dir = this.sprite.furniBase.getUIDirection()
            
            this.sprite.setDirection(dir)

            this.sprite.update(true)

            this.container = this.sprite.container
        
        } catch (e) {

            this.sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniPlaceholder(FurnidataItemType.FloorItem, this.entity.name)

            await this.sprite.init()

            this.sprite.update(true)

            this.container = this.sprite.container
            
            console.log(this.container)
        }

        if(!this._entity) return;

        let spriteZIndex = (this._entity as Item).base.getLogicDimension(2)
        
        if(!this.container) return;

        this.container.zIndex = this.getZIndex(spriteZIndex)

        this.container.interactive = true


        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.sprite.container)
            
            this.updatePosition()
        }
        this.entity.logic?.registerEvents()
        this.entity.logic?.events.emit(ItemEvents.ITEM_LOADED)
    }

    public calculateOffsetX(): number {
        let currentRoom = Engine.getInstance().roomService?.CurrentRoom
        let tile: Tile = currentRoom.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this.position.getX()), Math.round(this.position.getY())))

        return (((tile!.position.getY() - tile!.position.getX()) * MapData.tileWidth / 2) + (MapData.tileWidth / 2))
    }

    public calculateOffsetY(): number {
        let currentRoom = Engine.getInstance().roomService?.CurrentRoom
        let tile: Tile = currentRoom.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.round(this.position.getX()), Math.round(this.position.getY())))

        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -FurniData.FURNI_TOP_OFFSET

        return ((tile!.position.getY() + tile!.position.getX()) * MapData.tileHeight / 2 + MapData.tileHeight / 2) + offsetFloor + 3
    }

    public getZIndex(zIndex: number = 1): number {
        const compareY = (Math.trunc((this._entity as Item).base.getLogicDimension(2) / 100)) / 10
        return RoomVisualization.calculateZIndex(new Point3d(this.entity.position.getX(), this.entity.position.getY() + compareY, this.entity.position.getZ()), RoomPriority.ROOM_ITEM)
    }

    public getSprite() {
        return this.sprite;
    }
}