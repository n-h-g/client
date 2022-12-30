import EntityLogic from "../../../../../../core/room/object/entities/EntityLogic";
import { Engine } from "../../../../../../Engine";
import { OutgoingPacket } from "../../../../../../networking/packets/outgoing/OutgoingPacket";
import Point from "../../../../../../utils/point/Point";
import UiUtils from "../../../../../../utils/UiUtils";
import ChatData from "../../../../../game/chat/ChatData";
import { BottomBarUI } from "../../../../../ui/components/static/BottomBarUI";
import { UIComponent } from "../../../../../ui/components/UIComponent";
import { ActionId } from "../../../../../ui/imagers/avatars/enum/actions/ActionId";
import AvatarData from "../../../../../ui/imagers/avatars/enum/AvatarData";
import UserEntity from "../UserEntity";
import UserEntityVisualization from "../visualization/UserEntityVisualization";

export default class UserEntityLogic extends EntityLogic  {

    public frameTracker: number = 0;

    public constructor(entity: UserEntity) {
        super(entity)
    }

    public onDance(): void {
        throw new Error("Method not implemented.");
    }

    public registerEvents() {

        this.entity.visualization?.container?.on('pointerdown', () => this.onClick())
        this.entity.visualization?.container?.on('user-position-changed',() => this.onPositionChanged())
        this.entity.visualization?.container?.on('user-started-typing', () => this.userToggleTyping(true))
        this.entity.visualization?.container?.on('user-stop-typing', () => this.userToggleTyping(false))
        this.entity.visualization?.container?.on('user-look-changed', () => this.userLookChanged())
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
        let userVisualization = (this.entity.visualization as UserEntityVisualization)

        if(userVisualization.Actions.has(ActionId.WALK)) {
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
        let roomId = Engine.getInstance().roomService?.CurrentRoom?.Id;
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
        /*let previewBox = (Engine.getInstance().userInterfaceManager?.componentsManager.getComponent(UIComponent.PreviewBoxUI) as PreviewBoxUI)
        previewBox.Gui.$data.mode = 'user';
        previewBox.Gui.$data.motto = (this.entity as UserEntity).user?.userInfo.motto;
        previewBox.Gui.$data.username = this.entity.Name
        previewBox.Gui.$data.optionVisible = true;
        let image: HTMLImageElement | undefined = UiUtils.generateImageFromObject((this.entity.visualization?.container!));
        previewBox.Gui.$data.image = image?.src;
        previewBox.Gui.$forceUpdate();
        previewBox.show();*/
    }

    private userLookChanged() {
        let bottomBarGui = (Engine.getInstance().userInterfaceManager?.componentsManager.getComponent(UIComponent.BottomBarUI) as BottomBarUI)
        let image: HTMLImageElement | undefined = UiUtils.generateImageFromObject((this.entity.visualization?.container!));
        //bottomBarGui.$data.look = image?.src;
        //bottomBarGui.$forceUpdate();
    }

    public tick(delta: number): void {
        let userVisualization = (this.entity.visualization as UserEntityVisualization)

        if(userVisualization.needsUpdate) {
            this.frameTracker += delta;

            if (this.frameTracker >= AvatarData.AVATAR_FRAME_SPEED) {
                userVisualization.nextFrame();
                this.frameTracker = 0;
                (userVisualization as UserEntityVisualization).draw();
            }
            if(userVisualization.Actions.has(ActionId.WALK)) {
                this.onMove(delta);
            }
        }
    }
}