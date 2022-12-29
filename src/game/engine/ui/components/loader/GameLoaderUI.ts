import { AppContext, getCurrentInstance } from 'vue'
import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { IComponentDeletableUI } from '../../../../core/ui/IComponentDeletableUI'
import { LoadProgressEvent } from '../../events/LoadProgressEvent'
import { EventManager } from '../../events/EventManager'
import { UIEvents } from '../../events/UIEvents'

export class GameLoaderUI implements IComponentDeletableUI { 
    private gameLoaderGUI: typeof GameLoaderGUI
    private appContext: AppContext
    public visible: boolean = true

    constructor() {
        this.gameLoaderGUI = GameLoaderGUI
        this.appContext = getCurrentInstance().appContext

        EventManager.read(UIEvents.LOAD, (event: LoadProgressEvent) => {
            if (event.data.width == 100) {
                this.delete()
            }
        })
    }

    init(): void {
        UiUtils.renderComponent({
            el: '#gameContainer',
            component: this.gameLoaderGUI,
            appContext: this.appContext
        })
    }

    delete(): void {
        UiUtils.unrenderComponent()
    }
}