import { AppContext, getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../../core/ui/IComponentUI'
import BottomBarGUI from '../../../../../ui/components/static/bottomBar/BottomBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { LoadProgressEvent } from '../../events/LoadProgressEvent'

export class BottomBarUI implements IComponentUI { 
    private bottomBarGUI: typeof BottomBarGUI
    private appContext: AppContext

    constructor() {
        this.bottomBarGUI = BottomBarGUI
        this.appContext = getCurrentInstance().appContext

        EventManager.read('load-progress', (event: LoadProgressEvent) => {
            if (event.data.width == 100) {
                this.add()
            }
        })
    }

    init(): void {
        
    }

    public add(): void {
        UiUtils.renderComponent({
            el: '#gameContainer',
            component: this.bottomBarGUI,
            appContext: this.appContext
        })
    }
}