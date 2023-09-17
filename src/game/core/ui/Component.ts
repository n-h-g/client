import {UIComponent} from '../../engine/ui/components/UIComponent';
import {IComponentUI} from './IComponentUI';
import {Component as ComponentGUI} from 'vue';

export abstract class Component implements IComponentUI {
    private _type: UIComponent;
    private componentGUI: ComponentGUI;

    constructor(component: ComponentGUI, type: UIComponent) {
        this.componentGUI = component;
        this._type = type;
    }

    abstract init(): void;

    get component(): ComponentGUI {
        return this.componentGUI;
    }

    get type(): UIComponent {
        return this._type;
    }
}
