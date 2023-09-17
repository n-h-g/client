import {Engine} from '../../../../../Engine';
import {EntityEvents} from '../../../../../engine/events/room/objects/entities/EntityEvents';
import {ItemEvents} from '../../../../../engine/events/room/objects/entities/ItemEvents';
import {Item} from '../../../../../engine/room/objects/items/Item';
import {FurniData} from '../../../../../engine/ui/imagers/items/FurniData';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {MoveableLogic} from '../../IMoveable';
import {EntityLogic} from '../../entities/EntityLogic';

export abstract class ItemLogic extends EntityLogic implements MoveableLogic {
    _roll = false;

    constructor(item: Item) {
        super(item);
    }

    registerEvents(): void {
        super.registerEvents();

        this.events.on(ItemEvents.ITEM_LOADED, () => this.onLoad());
        this.events.on(EntityEvents.POSITION_CHANGED, () =>
            this.onPositionChanged()
        );
        this.events.on(EntityEvents.START_ROLL, () =>
            this.toggleMovement(true)
        );
        this.events.on(EntityEvents.STOP_ROLL, () => this.stopRolling());
    }

    onLoad() {}

    onHover(): void {
        super.onHover();
    }

    onPositionChanged(): void {}

    placeItem() {
        Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.RoomPickupItemEvent,
            {
                id: this.entity.id,
            }
        );
        Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.RoomPlaceItemEvent,
            {
                id: this.entity.id,
                x: this.entity.position.x,
                y: this.entity.position.y,
                z: this.entity.position.z,
            }
        );

        this.toggleMovement(false);
    }

    onClick(): void {
        super.onClick();
    }

    toggleMovement(value: boolean): void {
        this._roll = value;
        this.entity.visualization.needsUpdate = value;
        this.entity.visualization.sprite.container.alpha =
            (value ? FurniData.LOADING_ALPHA : FurniData.DEFAULT_ALPHA) / 255;
    }

    onMove(delta: number): void {
        this.entity.visualization.move(delta * 1000);
    }

    tick(delta: number) {
        if (this._roll) {
            this.onMove(delta);
        }

        if (!this.entity) {
            return;
        }

        if (this.entity.visualization.needsUpdate)
            this.entity.visualization.draw();
    }

    stopRolling() {
        this.entity.visualization.needsUpdate = false;

        this.toggleMovement(false);

        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
            OutgoingPacket.RoomMoveItemEvent,
            {
                id: this.entity.id,
                name: this.entity.name,
                x: this.entity.position.x,
                y: this.entity.position.y,
                z: this.entity.position.z,
            }
        );

        this._roll = false;
    }

    get roll(): boolean {
        return this._roll;
    }
}
