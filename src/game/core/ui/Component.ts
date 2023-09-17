import {UIComponent} from '../../engine/ui/components/UIComponent';
import {IComponentUI} from './IComponentUI';
import {Component as ComponentGUI} from 'vue';

export abstract class Component implements IComponentUI {

    constructor(public readonly component: ComponentGUI, public readonly type: UIComponent) {}

    abstract init(): void;
}
