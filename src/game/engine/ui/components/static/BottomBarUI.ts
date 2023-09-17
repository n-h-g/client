import {IComponentUI} from '../../../../core/ui/IComponentUI';
import BottomBarGUI from '../../../../../ui/components/static/bottomBar/BottomBarGUI.vue';
import UiUtils from '../../../../utils/UiUtils';
import {EventManager} from '../../../../core/events/EventManager';
import {LoadingProgressEventData} from '../../../events/ui/data/loader/LoadingProgress';
import {UIComponent} from '../UIComponent';
import {Engine} from '../../../../Engine';
import {UIEvents} from '../../../events/ui/UIEvents';

export class BottomBarUI implements IComponentUI {
    private bottomBarGUI: typeof BottomBarGUI;

    constructor() {
        this.bottomBarGUI = BottomBarGUI;
    }

    init(): void {
        EventManager.read(UIEvents.LOAD, (event: LoadingProgressEventData) => {
            if (event.width == 100 || Engine.getInstance().config.offlineMode) {
                UiUtils.mountComponent(
                    this.bottomBarGUI,
                    UIComponent.BottomBarUI
                );
            }
        });
    }
}
