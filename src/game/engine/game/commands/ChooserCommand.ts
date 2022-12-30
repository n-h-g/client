
import { Engine } from "../../../Engine";
import Command from "./Command";

export default class ChooserCommand extends Command {
    public constructor() {
        super("chooser")
    }

    public handle(args: string[]): void {

        let currentRoom = Engine.getInstance().roomService!.CurrentRoom;

        //let list = Engine.getInstance().userInterfaceManager?.componentsManager?.getComponent(UIComponent.ListUI) as ListUI

        //todo, make ListUIMode a enum
        /*list.mode("user")

        if (Engine.getInstance().RoomsManager?.CurrentRoom?.RoomUsersManager.getAll() == undefined) {
            return;
        }

        for (let user of Engine.getInstance().RoomsManager?.CurrentRoom?.RoomUsersManager.getAll().values()!) {
            list.add(user.userInfo.username!);
        }
        list.toggle()*/
    }
}