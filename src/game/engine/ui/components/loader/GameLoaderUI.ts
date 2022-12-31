import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { IComponentDeletableUI } from '../../../../core/ui/IComponentDeletableUI'
import { LoadProgressEvent } from '../../events/loader/LoadProgressEvent'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'
import { UIComponent } from '../UIComponent'
import { Engine } from '../../../../Engine'

export class GameLoaderUI implements IComponentDeletableUI { 
    private gameLoaderGUI: typeof GameLoaderGUI
    public visible: boolean = true

    constructor() {
        this.gameLoaderGUI = GameLoaderGUI
    }

    init(): void {
        UiUtils.renderComponent(this.gameLoaderGUI, UIComponent.GameLoaderUI)

        EventManager.read(UIEvents.LOAD, (event: LoadProgressEvent) => {
            if (event.width == 100 || Engine.getInstance().config.offlineMode) {
                this.delete()
            }
        })
    }

    delete(): void {
        UiUtils.unrenderComponent('gameLoader')
    }
}