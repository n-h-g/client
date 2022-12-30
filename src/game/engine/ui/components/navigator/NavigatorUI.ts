import NavigatorGUI from '../../../../../ui/components/navigator/NavigatorGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { LoadProgressEvent } from '../../events/LoadProgressEvent'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { IComponentShowableUI } from '../../../../core/ui/IComponentShowableUI'
import { UIComponent } from '../UIComponent'

export class NavigatorUI implements IComponentShowableUI { 
    private NavigatorGUI: typeof NavigatorGUI
    public visible: boolean = true

    constructor() {
        this.NavigatorGUI = NavigatorGUI
    }

    init(): void {
        UiUtils.renderComponent(this.NavigatorGUI, UIComponent.NavigatorUI)

        EventManager.read(UIEvents.LOAD, (event: LoadProgressEvent) => {
            if (event.width == 100) {
                this.delete()
            }
        })
    }

    hide(): void {
        throw new Error('Method not implemented.')
    }
    show(): void {
        throw new Error('Method not implemented.')
    }
    toggle(): void {
        throw new Error('Method not implemented.')
    }

    delete(): void {
        UiUtils.unrenderComponent('gameLoader')
    }
}