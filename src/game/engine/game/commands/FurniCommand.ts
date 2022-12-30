import Command from "./Command";

export default class FurniCommand extends Command{
    public constructor() {
        super("furni")
    }

    public handle(args: string[]): void {

        /*let currentRoom = Engine.getInstance().RoomsManager!.CurrentRoom;
        
        let list = Engine.getInstance().userInterfaceManager?.getUIComponentManager().getComponent(UIComponent.ListUI) as ListUI

        if(Engine.getInstance().RoomsManager?.CurrentRoom?.RoomItemManager.getAll() == undefined) {
            return;
        }

        list.mode("furni");

        for(let item of Engine.getInstance().RoomsManager?.CurrentRoom?.RoomItemManager.getAll().values()!) {
            list.add(item);
        }
        
        list.toggle()*/
    }
}