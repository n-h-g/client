import { getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../../core/ui/IComponentUI'
import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import UiUtils from '../../../../utils/UiUtils'

export class GameLoaderUI implements IComponentUI { 
    private gameLoaderGUI: typeof GameLoaderGUI

    public visible: boolean = true

    constructor() {
        this.gameLoaderGUI = GameLoaderGUI
    }
    init(): void {
        UiUtils.renderComponent({
            el: '#gameContainer',
            component: this.gameLoaderGUI,
            appContext: getCurrentInstance().appContext
        })
    }

    delete(): void {
        throw new Error('Method not implemented.')
    }

}