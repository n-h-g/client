import {Engine} from '../../../../Engine';
import {IComponentShowableUI} from '../../../../core/ui/IComponentShowableUI';
import {CommandHelp, CommandsList as Commands} from '../../../../engine/game/commands/CommandsList';
import {UIComponent} from '../../../../engine/ui/components/UIComponent';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The commands of the server (:commands): {commands: [{usage, description}]}. The window opens with them. */
export class CommandsList extends MessageHandler {
    handle(): void {
        const commands: CommandHelp[] = Array.isArray(this.message?.commands) ? this.message.commands : [];

        Commands.setServerCommands(commands.map(command => ({
            usage: String(command.usage ?? ''),
            description: String(command.description ?? ''),
        })));

        const window = Engine.getInstance()?.userInterfaceManager?.componentsManager
            ?.getComponent<IComponentShowableUI>(UIComponent.CommandsUI);

        // again with the new list if it's open
        window?.hide();
        window?.show();
    }
}
