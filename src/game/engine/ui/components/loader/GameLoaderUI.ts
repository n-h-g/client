import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { IComponentDeletableUI } from '../../../../core/ui/IComponentDeletableUI'
import { LoadingProgressEventData } from '../../events/data/loader/LoadingProgress'
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
        UiUtils.mountComponent(this.gameLoaderGUI, UIComponent.GameLoaderUI)

        EventManager.read(UIEvents.LOAD, (event: LoadingProgressEventData) => {
            if (event.width == 100 || Engine.getInstance().config.offlineMode) {
                this.delete()
            }
        })
    }

    delete(): void {
        UiUtils.dismountComponent(UIComponent.GameLoaderUI)
    }
}