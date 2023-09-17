import {UIComponent} from '../../engine/ui/components/UIComponent';
import {EventManager} from '../events/EventManager';
import {DialogEventData} from '../../engine/events/ui/data/general/Dialog';
import {UiUtils} from '../../utils/UiUtils';
import {InteractiveComponent} from './InteractiveComponent';
import {IComponentShowableUI} from './IComponentShowableUI';
import {Component} from 'vue';
import {UIEvents} from '../../engine/events/ui/UIEvents';

export abstract class ShowableComponent
    extends InteractiveComponent
    implements IComponentShowableUI
{
    visible = false;

    constructor(component: Component, type: UIComponent) {
        super(component, type);
        this.registerEvents();
    }

    init(): void {}

    toggle() {
        this.visible ? this.hide() : this.show();
    }

    hide(): void {
        UiUtils.dismountComponent(this.type);
        this.visible = false;
    }

    show(): void {
        UiUtils.mountComponent(this.component, this.type);
        this.visible = true;
    }

    registerEvents(): void {
        EventManager.read(UIEvents.CLOSE, (payload: DialogEventData) => {
            if (payload.type == this.eventType) {
                this.hide();
            }
        });

        EventManager.read(UIEvents.OPEN, (payload: DialogEventData) => {
            if (payload.type == this.eventType) {
                this.show();
            }
        });
    }
}
