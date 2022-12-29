import { AppContext, getCurrentInstance } from 'vue'
import { IComponentUI } from '../../../../core/ui/IComponentUI'
import TopBarGUI from '../../../../../ui/components/static/topBar/TopBarGUI.vue'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../events/EventManager'
import { LoadProgressEvent } from '../../events/LoadProgressEvent'
import { UIEvents } from '../../events/UIEvents'

export class TopBarUI implements IComponentUI { 
    private topBarUI: typeof TopBarGUI
    private appContext: AppContext

    constructor() {
        this.topBarUI = TopBarGUI
        this.appContext = getCurrentInstance().appContext

        EventManager.read(UIEvents.LOAD, (event: LoadProgressEvent) => {
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
            component: this.topBarUI,
            appContext: this.appContext
        })
    }
}