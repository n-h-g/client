import { AppContext, getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../../core/ui/IComponentUI'
import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import UiUtils from '../../../../utils/UiUtils'

export class GameLoaderUI implements IComponentUI { 
    private gameLoaderGUI: typeof GameLoaderGUI
    private appContext: AppContext

    public visible: boolean = true

    constructor() {
        this.gameLoaderGUI = GameLoaderGUI
        this.appContext = getCurrentInstance().appContext
    }

    init(): void {
        UiUtils.renderComponent({
            el: '#gameContainer',
            component: this.gameLoaderGUI,
            appContext: this.appContext
        })
    }

    delete(): void {
        throw new Error('Method not implemented.')
    }
}