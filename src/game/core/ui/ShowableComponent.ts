import { UIComponent } from "../../engine/ui/components/UIComponent";
import { EventManager } from "../../engine/ui/events/EventManager";
import { DialogEventData } from "../../engine/ui/events/data/general/Dialog";
import { UIEvents } from "../../engine/ui/events/UIEvents";
import UiUtils from "../../utils/UiUtils";
import { InteractiveComponent } from "./InteractiveComponent";
import { IComponentShowableUI } from "./IComponentShowableUI";
import { Component } from "vue";

export abstract class ShowableComponent extends InteractiveComponent implements IComponentShowableUI {
    public visible: boolean = false

    public constructor(component: Component, type: UIComponent) {
        super(component, type)

        this.registerEvents()
    }

    public init(): void {

    }

    public toggle() {
        this.visible ? this.hide() : this.show();
    }

    public hide(): void {
        UiUtils.dismountComponent(this.type)
        this.visible = false;
    }

    public show(): void {
        UiUtils.mountComponent(this.component, this.type)
        this.visible = true;
    }

    public registerEvents(): void {
        EventManager.read(UIEvents.CLOSE, (payload: DialogEventData) => {
            if (payload.type == this.eventType) {
                this.hide()
            }
        })

        EventManager.read(UIEvents.OPEN, (payload: DialogEventData) => {
            if (payload.type == this.eventType) {
                this.show()
            }
        })
    }
}