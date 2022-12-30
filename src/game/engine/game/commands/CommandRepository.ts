import ICommandRepository from "../../../core/game/commands/ICommandRepository";
import Repository from "../../../core/Repository";
import Command from "./Command";

export default class CommandRepository extends Repository<string, Command> implements ICommandRepository {
    getCommandByAlias(alias: string): Command | null{
        for(let command of this.getAll().values()) {
            if(command.aliases.indexOf(alias) > -1) return command;
        }

        return null;
    }
}