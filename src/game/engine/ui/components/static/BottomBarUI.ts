import { AppContext, getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../../core/ui/IComponentUI'
import BottomBarGUI from '../../../../../ui/components/static/bottomBar/BottomBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'

export class BottomBarUI implements IComponentUI { 
    private bottomBarGUI: typeof BottomBarGUI
    private appContext: AppContext

    constructor() {
        this.bottomBarGUI = BottomBarGUI
        this.appContext = getCurrentInstance().appContext
    }

    init(): void {
        UiUtils.renderComponent({
            el: '#gameContainer',
            component: this.bottomBarGUI,
            appContext: this.appContext
        })
    }
}