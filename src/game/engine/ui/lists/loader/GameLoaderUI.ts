import { getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../../core/ui/IComponentUI'
import GameLoaderGUI from '../../../../../ui/components/loader/GameLoaderGUI.vue'
import { renderComponent } from '../../utils/RenderComponent'
import IComponentShowableUI from '../../../../core/ui/IComponentShowableUI'

export class GameLoaderUI implements IComponentShowableUI { 
    private gameLoaderGUI: typeof GameLoaderGUI

    public visible: boolean = true

    constructor() {
        this.gameLoaderGUI = GameLoaderGUI
    }
    init(): void {
        renderComponent({
            el: '#gameContainer',
            component: this.gameLoaderGUI,
            appContext: getCurrentInstance().appContext
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

}