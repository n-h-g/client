import { Container } from 'pixi.js'
import { Engine } from '../../../../../Engine'
import { ItemEvents } from '../../../../../engine/events/room/objects/entities/ItemEvents'
import Item from '../../../../../engine/room/objects/items/Item'
import MapData from '../../../../../engine/room/objects/map/MapData'
import { Tile } from '../../../../../engine/room/objects/map/Tile'
import { RoomPriority } from '../../../../../engine/room/visualization/RoomPriority'
import RoomVisualization from '../../../../../engine/room/visualization/RoomVisualization'
import { FurniData } from '../../../../../engine/ui/imagers/items/FurniData'
import Point from '../../../../../utils/point/Point'
import Point3d from '../../../../../utils/point/Point3d'
import UiUtils from '../../../../../utils/UiUtils'
import { EntityVisualization } from '../../entities/EntityVisualization'
import { MoveableVisualization } from '../../IMoveable'
import { FurnidataItemType } from '../../../../../engine/ui/imagers/items/enum/FurniDataItemType'

export abstract class ItemVisualization extends EntityVisualization implements MoveableVisualization {
    protected position: Point3d
    protected iconImage: string
    public imagePreview: string
    protected isIcon: boolean = false 

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

            let temp: Container = this.sprite.container;

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
            const sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniSprite(FurnidataItemType.FloorItem, this.entity.name)

            await sprite.init()

            let dir = sprite.furniBase.getUIDirection()
            
            sprite.setDirection(dir)

            sprite.update(true)

            this.sprite = sprite
        
        } catch (e) {

            const sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniPlaceholder(FurnidataItemType.FloorItem, this.entity.name)

            await sprite.init()

            sprite.update(true)

            this.sprite = sprite
            
            //console.log(this.container)
        }

        //console.log(this.sprite.container)

        if(!this._entity) return;

        let spriteZIndex = (this._entity as Item).base.getLogicDimension(2)
        
        if(!this.sprite.container) return;

        this.sprite.container.zIndex = this.getZIndex(spriteZIndex)

        this.sprite.container.interactive = true

        this.container = this.sprite.container;
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
}