import { Engine } from '../../../../../Engine'
import Item from "../../../../../engine/room/objects/items/Item"
import FurniImager from "../../../../../engine/ui/imagers/items/FurniImager"
import { OutgoingPacket } from '../../../../../networking/packets/outgoing/OutgoingPacket'
import { EntityLogic } from '../../entities/EntityLogic'

export abstract class ItemLogic extends EntityLogic {
    protected _item: Item
    public _frameTracker: number = 0
    public _roll: boolean = false

    constructor(item: Item) {
        super(item)
        this._item = item
    }

    public registerEvents() {
        this._item.base.addListener("pointerdown", () => this.onClick())
        this._item.base.addListener("mouseup", this.onHover.bind(this))
    }

    public placeItem() {
        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.RoomPickupItemEvent, {
            id: this._item.id
        })

        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.RoomPlaceItemEvent, {
            id: this._item.id,
            name: this._item.name,
            x: this._item.position.getX(),
            y: this._item.position.getY(),
            z: this._item.position.getZ()
        });

        this.toggleMovement(false);
    }

    public onHover(): void {

    }

    public onClick(): void {
        let movingItem = Engine.getInstance().roomService.CurrentRoom!.roomItemRepository.movingItem
        let moving = movingItem?.id === this._item.id

        if (moving) {
            this.placeItem();
        } else {
            this.togglePreview();
        }
    }

    public toggleMovement(value: boolean): void {
        this._roll = value;
        this._item.visualization!.needsUpdate = value;
        this._item.base.alpha = value ? FurniImager.LOADING_ALPHA : FurniImager.DEFAULT_ALPHA;
        Engine.getInstance()!.roomService!.CurrentRoom.roomItemRepository.movingItem = value ? this._item : null;
    }

    public onMove(delta: number): void {
        this._item.visualization.move(delta * 1000);
    }

    public togglePreview() {

    }

    public tick(delta: number) {
        if (this._roll) {
            this.onMove(delta);
        }
    }
}