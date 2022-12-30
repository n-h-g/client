import { InteractionPixiEvents } from "pixi.js";
import Engine from "../../../../../Engine";
import Item from "../../../../../engine/room/objects/items/Item";
import RoomVisualization from "../../../../../engine/room/visualization/RoomVisualization";
import PreviewBoxUI from "../../../../../engine/ui/components/general/PreviewBoxUI";
import UIComponent from "../../../../../engine/ui/components/UIComponentEnum";
import FurniImager from "../../../../../engine/ui/imagers/items/FurniImager";

import { OutgoingPacket } from "../../../../../networking/packets/outgoing/OutgoingPacketEnum";
import RoomObjectLogic from "../../RoomObjectLogic";
import ItemVisualization from "../visualization/ItemVisualization";

export default abstract class ItemLogic extends RoomObjectLogic {

    protected item: Item;
    public frameTracker: number = 0;

    public roll: boolean = false;

    constructor(item: Item) {
        super();
        this.item = item;
    }

    public registerEvents() {
        this.item.base.addListener("pointerdown", () => this.onClick())
        this.item.base.addListener("mouseup", this.onHover.bind(this))
    }

    public placeItem() {
        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.RoomPickupItemEvent, {
            id: this.item.id
        })
        
        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.RoomPlaceItemEvent, {
            id: this.item.id,
            name: this.item.name,
            x: this.item.position.getX(),
            y: this.item.position.getY(),
            z: this.item.position.getZ()
        });

        this.toggleMovement(false);
    }

    public onHover(): void { }

    public onClick(): void {
        let movingItem = Engine.getInstance().roomManager!.CurrentRoom!.RoomItemManager.movingItem 
        let moving = movingItem?.id === this.item.id

        if(moving) {
            this.placeItem();
        } else {
            this.togglePreview();
        }

    
    }

    public toggleMovement(value: boolean): void {
        this.roll = value;
        this.item.visualization!.needsUpdate = value;
        this.item.base.alpha = value ? FurniImager.LOADING_ALPHA : FurniImager.DEFAULT_ALPHA;
        Engine.getInstance().roomManager!.CurrentRoom!.RoomItemManager.movingItem = value ? this.item : null;
    }
    
    public onMove(delta: number): void {
        let itemVisualization = this.item.visualization as ItemVisualization;
        itemVisualization.move(delta * 1000);
    }

    public togglePreview() {
        let preview = Engine.getInstance().userInterfaceManager?.getUIComponentManager().getComponent(UIComponent.PreviewBoxUI) as PreviewBoxUI;

        preview.setItem(this.item)
        preview.show();
    }

    public tick(delta: number) {
        if(this.roll) {
            this.onMove(delta);
        }
    }
}