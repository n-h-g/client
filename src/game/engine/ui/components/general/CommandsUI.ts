import CommandsGUI from '../../../../../ui/components/general/CommandsGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

/** The window of :commands. */
export class CommandsUI extends ShowableComponent {
    constructor() {
        super(CommandsGUI, UIComponent.CommandsUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.COMMANDS;
    }
}
