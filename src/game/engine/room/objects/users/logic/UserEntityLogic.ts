import { EntityLogic } from '../../../../../core/room/object/entities/EntityLogic';
import { HumanLogic } from '../../../../../core/room/object/human/logic/HumanLogic';
import { Engine } from "../../../../../Engine";
import { OutgoingPacket } from "../../../../../networking/packets/outgoing/OutgoingPacket";
import Point from "../../../../../utils/point/Point";
import UiUtils from "../../../../../utils/UiUtils";
import { ChatData } from '../../../../game/chat/ChatData';
import { EventManager } from '../../../../../core/events/EventManager';
import { ActionId } from "../../../../ui/imagers/avatars/enum/actions/ActionId";
import AvatarData from "../../../../ui/imagers/avatars/enum/AvatarData";
import { UserEntity } from '../UserEntity';
import UserEntityVisualization from '../visualization/UserEntityVisualization';
import { DialogEventData } from '../../../../events/ui/data/general/Dialog';
import { PreviewModeEventData } from '../../../../events/ui/data/general/PreviewUserData';
import { UIEvents } from '../../../../events/ui/UIEvents';
import { UIEventsType } from '../../../../events/ui/UIEventsType';

export default class UserEntityLogic extends HumanLogic {

    public onDance(): void {

    }

    public registerEvents() {
        this.events.on('user-started-typing', () => this.onToggleTyping(true))
        this.events.on('user-stop-typing', () => this.userToggleTyping(false))
        this.events.on('pointerdown', () => this.onClick())
        this.events.on('user-position-changed', () => this.onPositionChanged())
        this.events.on('user-look-changed', () => this.figureChanged())
        this.events.on('user-avatar-loading-completed', () => this.onLoad())
    }

    public onToggleTyping(typing: boolean = false): void {

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
        // should toggle entity name
    }

    public onPositionChanged() {
        this.setAvatarContainer()
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

     
        this.togglePreview();
    }
    public setAvatarContainer() {
        //let avatarContainerUI = Engine.getInstance().userInterfaceManager?..getComponent(UIComponent.AvatarContainerUI) as AvatarContainerUI

        let dimension = new Point(this.entity.visualization?.container?.height!,
            this.entity.visualization?.container?.width!
        );

        let position = new Point(UiUtils.getGlobalPosition(this.entity.visualization?.container!).tx + dimension.getY() + AvatarData.AVATAR_LEFT_TYPING_OFFSET,
            UiUtils.getGlobalPosition(this.entity.visualization?.container!).ty - dimension.getX() + AvatarData.AVATAR_TOP_TYPING_OFFSET);


        //avatarContainerUI.setSize(position, dimension)
    }
    public userToggleTyping(value: boolean) {
        this.setAvatarContainer()
        //let avatarContainerUI = Engine.getInstance().userInterfaceManager?.componentsManager.getComponent(UIComponent.AvatarContainerUI) as AvatarContainerUI
        //avatarContainerUI.toggleTyping(value)
    }

    public togglePreview() {
        let entity: UserEntity = this.entity as UserEntity
        EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, {
            mode: 'user',
            username: entity.name,
            motto: entity.user?.userInfo.motto,
            look: UiUtils.generateImageFromObject(this.entity.visualization?.container!).src
        })
        EventManager.emit<DialogEventData>(UIEvents.OPEN, {
            type: UIEventsType.PREVIEWBOX
        })
    }

    public figureChanged() {
        let image: HTMLImageElement = UiUtils.generateImageFromObject(this.entity.visualization?.container!);
        //bottomBarGui.$data.look = image?.src;
        //bottomBarGui.$forceUpdate();
    }
}