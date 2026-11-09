import {EventManager} from '../../../../../core/events/EventManager';
import {HumanLogic} from '../../../../../core/room/object/human/logic/HumanLogic';
import {IComponentShowableUI} from '../../../../../core/ui/IComponentShowableUI';
import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {Point} from '../../../../../utils/point/Point';
import {UiUtils} from '../../../../../utils/UiUtils';
import {HumanEvents} from '../../../../events/room/objects/entities/HumanEvents';
import {UserEvents} from '../../../../events/room/objects/entities/UserEvents';
import {AvatarContainerData} from '../../../../events/ui/data/avatar/AvatarContainerData';
import {UIEvents} from '../../../../events/ui/UIEvents';
import {ChatData} from '../../../../game/chat/ChatData';
import {UIComponent} from '../../../../ui/components/UIComponent';
import {ActionId} from '../../../../ui/imagers/avatars/enum/actions/ActionId';
import {AvatarData} from '../../../../ui/imagers/avatars/enum/AvatarData';
import {UserEntityVisualization} from '../visualization/UserEntityVisualization';
import {AvatarContextMenuData} from '../../../../events/ui/data/avatar/AvatarContextMenuData';
import {HumanVisualization} from '../../../../../core/room/object/human/visualization/HumanVisualization';

export class UserEntityLogic extends HumanLogic {
    private typing = false;
    private showLabel = false;

    private static SHOW_LABELS = false;

    onDance(): void {}

    registerEvents() {
        this.entity.visualization.container.on('pointerdown', (event: any) => {
            event.stopPropagation();
            this.onClick();
        });
        this.events.on(UserEvents.USER_TOGGLE_TYPING, (typing: boolean) =>
            this.onToggleTyping(typing)
        );
        this.entity.visualization.container.on('mouseover', e => {
            this.onHover();
            e.stopPropagation();
        });
        this.entity.visualization.container.on('mouseout', e => {
            this.onHover();
            e.stopPropagation();
        });
        this.events.on(HumanEvents.HUMAN_RENDERING_COMPLETE, () =>
            this.onLoad()
        );
    }

    onToggleTyping(typing): void {
        this.typing = typing;
        this.showLabel = false;

        // the bubble over the head of the avatar, for everybody in the room
        (this.entity.visualization as UserEntityVisualization).setTyping(!!typing);
    }

    onTalk(length?: number): void {
        setTimeout(
            () => {
                const EntityVisualization = this.entity
                    .visualization as UserEntityVisualization;
                EntityVisualization.addAction(ActionId.TALK);
                EntityVisualization.needsUpdate = false;
                EntityVisualization.frame = 0;
                EntityVisualization.draw();
            },
            length ?? 100 * ChatData.SPEAK_SPEED
        );
    }

    onMove(delta: number): void {
        const userVisualization = this.entity
            .visualization as UserEntityVisualization;

        if (userVisualization.actions.has(ActionId.WALK)) {
            userVisualization.move(delta);
        }
    }

    onHover(): void {
        super.onHover();

        if (!UserEntityLogic.SHOW_LABELS) return;

        this.showLabel = !this.showLabel;
        this.toggleUI();
    }

    onPositionChanged() {}

    onLoad(): void {
        this.showLabel = false;
    }

    onClick() {
        const user = this.entity as import('../UserEntity').UserEntity;
        if (user.userId != null && user.userId === Engine.getInstance().currentUserId) {
            const bounds = this.entity.visualization.container.getBounds();
            const visualization = this.entity.visualization as HumanVisualization;
            EventManager.emit<AvatarContextMenuData>(UIEvents.AVATAR_CONTEXT_MENU, {
                id: user.id,
                name: user.name,
                x: bounds.x + bounds.width / 2,
                y: bounds.y,
                sitting: visualization.actions.has(ActionId.SIT),
                isSelf: true,
                userId: user.userId,
            });
            return;
        }

        const roomId = Engine.getInstance().roomService?.currentRoom?.id;
        const x = this.entity.position.x;
        const y = this.entity.position.y;

        Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.UserLookAtPoint,
            {
                roomId: roomId,
                x: x,
                y: y,
            }
        );

        const bounds = this.entity.visualization.container.getBounds();
        const engine = Engine.getInstance();
        const ownsRoom = !!engine.currentUsername
            && engine.roomService?.currentRoom?.roomInfo.authorName === engine.currentUsername;

        EventManager.emit<AvatarContextMenuData>(UIEvents.AVATAR_CONTEXT_MENU, {
            id: this.entity.id,
            name: this.entity.name,
            x: bounds.x + bounds.width / 2,
            y: bounds.y,
            sitting: false,
            isSelf: false,
            userId: user.userId,
            isBot: user.isBot,
            // the server checks it again
            canPickUp: user.isBot && user.botOwnerId != null && (user.botOwnerId === engine.currentUserId || ownsRoom),
        });
    }

    figureChanged() {}

    private toggleUI() {
        if (Engine.getInstance().config.offlineMode) return;

        Engine.getInstance()
            .userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(
                UIComponent.AvatarContainerUI
            )
            .toggle();

        const dimension = new Point(
            this.entity.visualization?.container?.height!,
            this.entity.visualization?.container?.width!
        );

        const position = new Point(
            UiUtils.getGlobalPosition(this.entity.visualization?.container!)
                .tx +
                dimension.y / 2 +
                AvatarData.AVATAR_CONTAINER_OFFSET_LEFT,
            UiUtils.getGlobalPosition(this.entity.visualization?.container!)
                .ty -
                dimension.x +
                AvatarData.AVATAR_CONTAINER_OFFSET_TOP
        );

        EventManager.emit<AvatarContainerData>(
            UIEvents.AVATAR_CONTAINER_UPDATED,
            {
                label: this.entity.name,
                showLabel: this.showLabel,
                bounds: {
                    x: position.x,
                    y: position.y,
                    w: dimension.y,
                    h: dimension.x,
                },
                typing: this.typing,
            }
        );
    }
}
