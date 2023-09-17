import {IComponentUI} from '../../../../core/ui/IComponentUI';
import TopBarGUI from '../../../../../ui/components/static/topBar/TopBarGUI.vue';
import UiUtils from '../../../../utils/UiUtils';
import {EventManager} from '../../../../core/events/EventManager';
import {LoadingProgressEventData} from '../../../events/ui/data/loader/LoadingProgress';
import {UIComponent} from '../UIComponent';
import {Engine} from '../../../../Engine';
import {UIEvents} from '../../../events/ui/UIEvents';

export class TopBarUI implements IComponentUI {
    private topBarUI: typeof TopBarGUI;

    constructor() {
        this.topBarUI = TopBarGUI;
    }

    init(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadingProgressEventData) => {
            if (event.width == 100 || Engine.getInstance().config.offlineMode) {
                UiUtils.mountComponent(this.topBarUI, UIComponent.TopBarUI);
            }
        });
    }
}
