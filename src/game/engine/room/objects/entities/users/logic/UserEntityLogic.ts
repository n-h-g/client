import { EntityLogic } from '../../../../../../core/room/object/entities/EntityLogic';
import { Engine } from "../../../../../../Engine";
import { OutgoingPacket } from "../../../../../../networking/packets/outgoing/OutgoingPacket";
import Point from "../../../../../../utils/point/Point";
import UiUtils from "../../../../../../utils/UiUtils";
import { ChatData } from '../../../../../game/chat/ChatData';
import { DialogEventData } from '../../../../../ui/events/data/general/Dialog';
import { PreviewModeEventData } from '../../../../../ui/events/data/general/PreviewUserData';
import { EventManager } from '../../../../../ui/events/EventManager';
import { UIEvents } from '../../../../../ui/events/UIEvents';
import { UIEventsType } from '../../../../../ui/events/UIEventsType';
import { ActionId } from "../../../../../ui/imagers/avatars/enum/actions/ActionId";
import AvatarData from "../../../../../ui/imagers/avatars/enum/AvatarData";
import { UserEntity } from '../UserEntity';
import UserEntityVisualization from '../visualization/UserEntityVisualization';

export default class UserEntityLogic extends EntityLogic {
    public frameTracker: number = 0;

    public onDance(): void {

    }

    public registerEvents() {
        this.entity.visualization?.container?.on('pointerdown', () => this.onClick())
        this.entity.visualization?.container?.on('user-position-changed', () => this.onPositionChanged())
        this.entity.visualization?.container?.on('user-started-typing', () => this.userToggleTyping(true))
        this.entity.visualization?.container?.on('user-stop-typing', () => this.userToggleTyping(false))
        this.entity.visualization?.container?.on('user-look-changed', () => this.userLookChanged())
        this.entity.visualization?.container?.on('user-avatar-loading-completed', () => this.onLoad())
    }

    public onLoad(): void {
        this.entity.visualization.draw()
    }

    public onTalk(length?: number): void {
        setTimeout(() => {
            this.entity.visualization?.removeAction(ActionId.TALK)
            this.entity.visualization!.needsUpdate = false;
            this.entity.visualization?.updateFrame(0);
            this.entity.visualization?.draw()
        }, length ?? 100 * ChatData.SPEAK_SPEED)
    }

    public onMove(delta: number): void {
        let userVisualization = this.entity.visualization as UserEntityVisualization

        if (userVisualization.Actions.has(ActionId.WALK)) {
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

    private userLookChanged() {
        let image: HTMLImageElement = UiUtils.generateImageFromObject(this.entity.visualization?.container!);
        //bottomBarGui.$data.look = image?.src;
        //bottomBarGui.$forceUpdate();
    }

    public tick(delta: number): void {
        let userVisualization = this.entity.visualization

        if (userVisualization.needsUpdate) {
            this.frameTracker += delta;

            if (this.frameTracker >= AvatarData.AVATAR_FRAME_SPEED) {
                userVisualization.nextFrame();
                this.frameTracker = 0;
                userVisualization.draw();
            }
            if (userVisualization.Actions.has(ActionId.WALK)) {
                this.onMove(delta);
            }
        }
    }
}