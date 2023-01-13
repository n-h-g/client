import { EventManager } from '../../../../../core/events/EventManager';
import { HumanLogic } from '../../../../../core/room/object/human/logic/HumanLogic';
import { IComponentShowableUI } from '../../../../../core/ui/IComponentShowableUI';
import { Engine } from "../../../../../Engine";
import { OutgoingPacket } from "../../../../../networking/packets/outgoing/OutgoingPacket";
import Point from "../../../../../utils/point/Point";
import UiUtils from "../../../../../utils/UiUtils";
import { UserEvents } from '../../../../events/room/objects/entities/UserEvents';
import { AvatarContainerData } from '../../../../events/ui/data/avatar/AvatarContainerData';
import { UIEvents } from '../../../../events/ui/UIEvents';
import { ChatData } from '../../../../game/chat/ChatData';
import { UIComponent } from '../../../../ui/components/UIComponent';
import { ActionId } from "../../../../ui/imagers/avatars/enum/actions/ActionId";
import AvatarData from "../../../../ui/imagers/avatars/enum/AvatarData";
import UserEntityVisualization from '../visualization/UserEntityVisualization';

export default class UserEntityLogic extends HumanLogic {

    private _typing: boolean = false

    public onDance(): void {

    }

    public registerEvents() {
        this.entity.visualization.container.on('pointerdown', () => this.onClick())
        this.events.on(UserEvents.USER_TOGGLE_TYPING, () => this.onToggleTyping())
        this.entity.visualization.container.on('mouseover', () => this.onHover())
        //this.entity.visualization.container.on('mouseout', () => this.onHover())
    }

    public onToggleTyping(): void {
        this._typing = !this._typing
    }

    public onTalk(length?: number): void {
        setTimeout(() => {
            let EntityVisualization = this._entity.visualization as UserEntityVisualization
            EntityVisualization.addAction(ActionId.TALK)
            EntityVisualization.needsUpdate = false;
            EntityVisualization.frame = 0
            EntityVisualization.draw()
        }, length ?? 100 * ChatData.SPEAK_SPEED)
    }

    public onMove(delta: number): void {
        let userVisualization = this.entity.visualization as UserEntityVisualization

        if (userVisualization.actions.has(ActionId.WALK)) {
            userVisualization.move(delta);
        }
    }

    public onHover(): void {
        //this.toggleUI()
    }

    private toggleUI() {
        
        (Engine.getInstance().userInterfaceManager.componentsManager.getComponent(UIComponent.AvatarContainerUI) as IComponentShowableUI).toggle()

        let dimension = new Point(this.entity.visualization?.container?.height!,
            this.entity.visualization?.container?.width!
            );        


        let position = new Point(UiUtils.getGlobalPosition(this.entity.visualization?.container).tx,
                                UiUtils.getGlobalPosition(this.entity.visualization?.container!).ty);        


        EventManager.emit<AvatarContainerData>(UIEvents.AVATAR_CONTAINER_UPDATED, {
           label: this.entity.name,
           showLabel: true,
           bounds: {
             x: this.entity.visualization.container.x,
             y: this.entity.visualization.container.y,
             w: dimension.getX(),
             h: dimension.getY()
           },
           typing: this._typing
        })
    }

    public onPositionChanged() {
        //this.setAvatarContainer()
    }

    public onClick() {
        let roomId = Engine.getInstance().roomService?.CurrentRoom?.id;
        let x = this.entity.position.getX();
        let y = this.entity.position.getY();

        Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.UserLookAtPoint, {
            roomId: roomId,
            x: x,
            y: y
        })

        super.onClick()
    }

    public userToggleTyping(value: boolean) {
       
    }

    public figureChanged() {
        let image: HTMLImageElement = UiUtils.generateImageFromObject(this.entity.visualization?.container!);
        //bottomBarGui.$data.look = image?.src;
        //bottomBarGui.$forceUpdate();
    }
}