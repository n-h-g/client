import { Engine } from '../../../../../Engine'
import { ItemEvents } from '../../../../../engine/events/room/objects/entities/ItemEvents'
import Item from "../../../../../engine/room/objects/items/Item"
import FurniImager from "../../../../../engine/ui/imagers/items/FurniImager"
import { OutgoingPacket } from '../../../../../networking/packets/outgoing/OutgoingPacket'
import { EntityLogic } from '../../entities/EntityLogic'

export abstract class ItemLogic extends EntityLogic {

    public _roll: boolean = false

    constructor(item: Item) {
        super(item)
    }

    public registerEvents(): void {
        super.registerEvents()

        this.events.on(ItemEvents.FURNI_SPRITE_LOADED, () => this.onLoad())
    }

    public async onLoad() {
        
    }

    public onHover(): void {
        
    }

    public onPositionChanged(): void {
        
    }

    public placeItem() {
        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.RoomPickupItemEvent, {
            id: this.entity.id
        })

        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.RoomPlaceItemEvent, {
            id: this.entity.id,
            x: this.entity.position.getX(),
            y: this.entity.position.getY(),
            z: this.entity.position.getZ()
        });

        this.toggleMovement(false);
    }

    public onClick(): void {
        super.onClick()
        let movingItem = Engine.getInstance().roomService.CurrentRoom!.roomItemRepository.movingItem
        let moving = movingItem?.id === this.entity.id

        if (moving) {
            this.placeItem();
        } 
    }

    public toggleMovement(value: boolean): void {
        this._roll = value;
        this.entity.visualization!.needsUpdate = value;
        this.entity.visualization.container.alpha = value ? FurniImager.LOADING_ALPHA : FurniImager.DEFAULT_ALPHA;
        //Engine.getInstance()!.roomService!.CurrentRoom.roomItemRepository.movingItem = value ? this.entity : null;
    }

    public onMove(delta: number): void {
        this.entity.visualization.move(delta * 1000);
    }

    public tick(delta: number) {
        if (this._roll) {
            this.onMove(delta);
        }
    }
}