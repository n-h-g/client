import { Engine } from '../../../../../Engine'
import { ItemEvents } from '../../../../../engine/events/room/objects/entities/ItemEvents'
import Item from '../../../../../engine/room/objects/items/Item'
import MapData from '../../../../../engine/room/objects/map/MapData'
import { Tile } from '../../../../../engine/room/objects/map/Tile'
import { RoomPriority } from '../../../../../engine/room/visualization/RoomPriority'
import RoomVisualization from '../../../../../engine/room/visualization/RoomVisualization'
import { FurniData } from '../../../../../engine/ui/imagers/items/FurniData'
import { FurnidataItemType } from '../../../../../engine/ui/imagers/items/FurniImager'
import { FurniSprite } from '../../../../../engine/ui/imagers/items/FurniSprite'
import { Logger } from '../../../../../utils/Logger'
import Point from '../../../../../utils/point/Point'
import Point3d from '../../../../../utils/point/Point3d'
import UiUtils from '../../../../../utils/UiUtils'
import { EntityVisualization } from '../../entities/EntityVisualization'
import { MoveableVisualization } from '../../IMoveable'

export default abstract class ItemVisualization extends EntityVisualization implements MoveableVisualization {
    private position: Point3d
    public iconImage: string
    public imagePreview: string
    public isIcon: boolean = false 
    private sprite: FurniSprite

    constructor(item: Item) {
        super(item)
        this.position = item.position
        this.iconImage = this.generateIcon()
        this.imagePreview = this.generateImagePreview()
    }

    public nextFrame(): void {
        throw new Error('Method not implemented.')
    }

    public draw(): void {
        if (Engine.getInstance().roomService?.CurrentRoom) {

            let temp: FurniSprite = this.container as FurniSprite;

            if(this.container) {
                (this.container as FurniSprite).restore()
            }

            this.container = temp;
            
            (this.container as FurniSprite).update();

            this.container.alpha = FurniData.DEFAULT_ALPHA;

            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
            this.updatePosition()
            this.entity.logic.registerEvents()
        }
    }

    public generateImages() {
        if (this.isIcon) {
            let icon = this.sprite.turnIntoIcon()

            setTimeout(() => {
                this.iconImage = UiUtils.generateBase64FromObject(icon)
            }, 2000)
        }
    }

    public turnIntoIcon() {
        let icon = this.sprite.turnIntoIcon()
        this.entity.visualization.container = icon
        this.needsUpdate = false
        this.isIcon = true
    }

    public restore() {
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

        console.log('rendering...')

        try {
            let sprite = await Engine.getInstance().userInterfaceManager.furniImager.loadFurniSprite(FurnidataItemType.FloorItem, this.entity.name)

            sprite.start()

            let dir = sprite.getNextDirection(this.rotation)

            this.direction = dir

            sprite.setAnimation(2)

            sprite.setDirection(dir)

            sprite.update()

            this.container = sprite

        } catch (e) {
            if(Engine.getInstance().config.debug)
                Logger.error(e.message)
        }

        if(!this._entity) return;


        let spriteZIndex = (this._entity as Item).base.data.logic.dimensions[2]

        this.container.zIndex = this.getZIndex(spriteZIndex)

        this.container.interactive = true

        if (Engine.getInstance().roomService?.CurrentRoom) {
            Engine.getInstance().roomService?.CurrentRoom?.roomLayout.Visualization.container?.addChild(this.container)
            this.updatePosition()
        }

        this.entity.logic?.registerEvents()

        this.entity.logic.onLoad()

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

        let offsetFloor = tile!.position.getZ() > 0 ? -MapData.thickSpace * MapData.stepHeight * tile!.position.getZ() : -FurniData.FURNI_TOP_OFFSET

        return ((tile!.position.getY() + tile!.position.getX()) * MapData.tileHeight / 2 + MapData.tileHeight / 2) + offsetFloor
    }

    public getZIndex(zIndex: number = 1): number {
        const compareY = (Math.trunc((this._entity as Item).base.data.logic.dimensions[2] / 100)) / 10
        return RoomVisualization.calculateZIndex(new Point3d(this.entity.position.getX(), this.entity.position.getY() + compareY, this.entity.position.getZ()), RoomPriority.ROOM_ITEM)
    }
}