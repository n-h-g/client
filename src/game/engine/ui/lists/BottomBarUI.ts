import { getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../core/ui/IComponentUI'
import BottomBarGUI from '../../../../ui/components/bottomBar/BottomBarGUI.vue'
import { renderComponent } from '../utils/RenderComponent'

export class BottomBarUI implements IComponentUI { 
    private bottomBarGUI: typeof BottomBarGUI

    constructor() {
        this.bottomBarGUI = BottomBarGUI
    }

    init(): void {
        renderComponent({
            el: '#gameContainer',
            component: this.bottomBarGUI,
            appContext: getCurrentInstance().appContext
        })
    }
}