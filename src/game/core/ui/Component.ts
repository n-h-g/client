import { UIComponent } from '../../engine/ui/components/UIComponent'
import { IComponentUI } from './IComponentUI'
import { Component as ComponentGUI }  from 'vue'

export default abstract class Component implements IComponentUI {
    private _type: UIComponent
    private componentGUI: ComponentGUI
    
    constructor(component: ComponentGUI, type: UIComponent) {
        this.componentGUI = component
        this._type = type
    }

    public abstract init(): void

    public get component(): ComponentGUI {
        return this.componentGUI
    }

    public get type(): UIComponent {
        return this._type
    }
}