import { Engine } from '../../../../../Engine'
import { EntityEvents } from '../../../../../engine/events/room/objects/entities/EntityEvents'
import { ItemEvents } from '../../../../../engine/events/room/objects/entities/ItemEvents'
import Item from '../../../../../engine/room/objects/items/Item'
import { FurniData } from '../../../../../engine/ui/imagers/items/FurniData'
import { OutgoingPacket } from '../../../../../networking/packets/outgoing/OutgoingPacket'
import { MoveableLogic, MoveableVisualization } from '../../IMoveable'
import { EntityLogic } from '../../entities/EntityLogic'

export abstract class ItemLogic extends EntityLogic implements MoveableLogic{

    public _roll: boolean = false

    constructor(item: Item) {
        super(item)
    }

    public registerEvents(): void {
        super.registerEvents()
        this.events.on(ItemEvents.FURNI_SPRITE_LOADED, () => this.onLoad())
        this.events.on(EntityEvents.POSITION_CHANGED, () => this.onPositionChanged())
        this.events.on(EntityEvents.START_ROLL, () => this.toggleMovement(true))
        this.events.on(EntityEvents.STOP_ROLL, () => this.stopRolling())
    }

    public onLoad() {

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
    }

    public toggleMovement(value: boolean): void {
        this._roll = value;
        this.entity.visualization.needsUpdate = value;
        this.entity.visualization.container.alpha = value ? FurniData.LOADING_ALPHA : FurniData.DEFAULT_ALPHA;
    }

    public onMove(delta: number): void {
        this.entity.visualization.move(delta * 1000);
    }

    public tick(delta: number) {
        if (this._roll) {
            this.onMove(delta);
        }

        if(!this.entity) {
            return;
        }

        if(this.entity.visualization.needsUpdate)
            this.entity.visualization.draw()
    }

    public stopRolling() {
        this.toggleMovement(false)
        
        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomPlaceItemEvent, {
            id: this.entity.id,
            name: this.entity.name,
            x: this.entity.position.getX(),
            y: this.entity.position.getY(),
            z: this.entity.position.getZ()
        })
    }

    public get roll(): boolean {
        return this._roll;
    }
}