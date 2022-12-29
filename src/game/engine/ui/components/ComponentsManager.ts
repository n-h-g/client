import { IComponentUI } from '../../../core/ui/IComponentUI'
import { UIComponent } from './UIComponent'
import { BottomBarUI } from './static/BottomBarUI'
import { GameLoaderUI } from './loader/GameLoaderUI'

export class ComponentsManager {
    private _rootComponent: HTMLElement
    private _gameComponents: Map<UIComponent, IComponentUI>

    constructor() {
        this._rootComponent = document.getElementById("gameContainer")
        this._gameComponents = new Map<UIComponent, IComponentUI>()
    }

    public loadGameComponents(): void {
        this.addComponent(UIComponent.StaticContainerUI, new BottomBarUI())
        this.addComponent(UIComponent.GameLoaderUI, new GameLoaderUI())
    }

    public initGameComponents(): void {
        for (let component of this._gameComponents.values()) {
            component.init()
        }
    }

    public get rootComponent(): HTMLElement {
        return this._rootComponent
    }

    public addComponent(componentKey: UIComponent, component: IComponentUI): void {
        if (this._gameComponents.has(componentKey))
            return

        this._gameComponents.set(componentKey, component)
    }

    public getComponent<IComponentUI>(componentKey: UIComponent): IComponentUI {
        return this._gameComponents.get(componentKey) as IComponentUI
    }
}