import {Engine} from '../../../Engine';
import {IComponentShowableUI} from '../../../core/ui/IComponentShowableUI';
import {UIComponent} from '../../ui/components/UIComponent';
import {Command} from './Command';

/** :furni — the Chooser with the furni of the room (as Habbo): a click on one is a click on it in the room. */
export class FurniCommand extends Command {
    constructor() {
        super('furni');
        this.usage = ':furni';
        this.description = 'Lists the furni of the room: a click on one is a click on it in the room.';
    }

    handle(): void {
        const engine = Engine.getInstance();
        if (!engine?.roomService?.currentRoom) return;

        engine.userInterfaceManager?.componentsManager
            ?.getComponent<IComponentShowableUI>(UIComponent.FurniChooserUI)?.show();
    }
}
