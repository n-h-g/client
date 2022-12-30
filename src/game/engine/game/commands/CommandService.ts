import Command from "./Command";
import ZoomCommand from "./ZoomCommand";
import IqqdCommand from "./IqqdCommand";
import ChooserCommand from "./ChooserCommand";
import FurniCommand from "./FurniCommand";
import Service from "../../../core/Service";
import ICommandRepository from "../../../core/game/commands/ICommandRepository";
import CommandRepository from "./CommandRepository";

export default class CommandService extends Service<ICommandRepository> {

    constructor() {
        super();

        this.repository = new CommandRepository();

        this.init();
    }

    public async init() {
        this.addCommand(new ZoomCommand())
        this.addCommand(new IqqdCommand())
        this.addCommand(new ChooserCommand())
        this.addCommand(new FurniCommand())
    }

    /**
     * Add a command to the repository
     * @param command 
     */
    private addCommand(command: Command) : void {
        this.repository?.add(command.definition, command)
    }

}