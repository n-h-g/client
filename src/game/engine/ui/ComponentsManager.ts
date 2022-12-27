import { IComponentUI } from '../../core/ui/IComponentUI'
import { UIComponent } from './ComponentsType'
import { BottomBarUI } from './lists/static/BottomBarUI'
import { EventManager } from './events/EventManager'
import { OpenBoxEvent, OpenBoxType } from './events/OpenBoxEvent'
import { GameLoaderUI } from './lists/loader/GameLoaderUI'

export class ComponentsManager {
    private _rootComponent: HTMLElement
    private _gameComponents: Map<UIComponent, IComponentUI>

    constructor() {
        this._rootComponent = document.getElementById("gameContainer")
        this._gameComponents = new Map<UIComponent, IComponentUI>()
    }

    public loadGameComponents(): void {
        this._gameComponents.set(UIComponent.StaticContainerUI, new BottomBarUI())
        //this._gameComponents.set(UIComponent.GameLoaderUI, new GameLoaderUI())
    }

    public initGameComponents(): void {
        for (let component of this._gameComponents.values()) {
            component.init()
        }
        let event = new OpenBoxEvent()
        event.data = {
            type: 'test'
        }
        EventManager.emit<OpenBoxType>('init', event)
    }

    public get rootComponent(): HTMLElement {
        return this._rootComponent
    }

    public addComponent(componentKey: UIComponent, component: IComponentUI): void {
        if (this._gameComponents.has(componentKey))
            return

        this._gameComponents.set(componentKey, component)
    }

    public getComponent<T>(componentKey: UIComponent): T {
        return this._gameComponents.get(componentKey) as T
    }
}