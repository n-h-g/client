import { getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../../core/ui/IComponentUI'
import BottomBarGUI from '../../../../../ui/components/static/bottomBar/BottomBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
export class BottomBarUI implements IComponentUI { 
    private bottomBarGUI: typeof BottomBarGUI

    constructor() {
        this.bottomBarGUI = BottomBarGUI
    }

    init(): void {
        UiUtils.renderComponent({
            el: '#gameContainer',
            component: this.bottomBarGUI,
            appContext: getCurrentInstance().appContext
        })
    }
}