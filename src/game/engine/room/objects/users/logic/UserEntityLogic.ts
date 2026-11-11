import {EventManager} from '../../../../../core/events/EventManager';
import {HumanLogic} from '../../../../../core/room/object/human/logic/HumanLogic';
import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {HumanEvents} from '../../../../events/room/objects/entities/HumanEvents';
import {UserEvents} from '../../../../events/room/objects/entities/UserEvents';
import {UIEvents} from '../../../../events/ui/UIEvents';
import {ChatData} from '../../../../game/chat/ChatData';
import {ActionId} from '../../../../ui/imagers/avatars/enum/actions/ActionId';
import {UserEntityVisualization} from '../visualization/UserEntityVisualization';
import {AvatarContextMenuData} from '../../../../events/ui/data/avatar/AvatarContextMenuData';
import {HumanVisualization} from '../../../../../core/room/object/human/visualization/HumanVisualization';

export class UserEntityLogic extends HumanLogic {

    onDance(): void {}

    registerEvents() {
        this.entity.visualization.container.on('pointerdown', (event: any) => {
            event.stopPropagation();
            this.onClick();
        });
        this.events.on(UserEvents.USER_TOGGLE_TYPING, (typing: boolean) =>
            this.onToggleTyping(typing)
        );
        this.events.on(HumanEvents.HUMAN_RENDERING_COMPLETE, () =>
            this.onLoad()
        );
    }

    onToggleTyping(typing): void {

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

    onPositionChanged() {}

    onLoad(): void {}

    onClick() {
        const user = this.entity as import('../UserEntity').UserEntity;

        // the card of the user (as Habbo's infostand), next to the menu over the avatar
        void this.togglePreview();
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
        const ownsRoom = engine.roomService?.ownsCurrentRoom() ?? false;

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
            canModerate: ownsRoom && !user.isBot && user.userId != null && user.userId !== engine.currentUserId,
        });
    }

    figureChanged() {}
}
