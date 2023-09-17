import {EventManager} from '../../../../../core/events/EventManager';
import {Entity} from '../../../../../core/room/object/entities/Entity';
import {HumanLogic} from '../../../../../core/room/object/human/logic/HumanLogic';
import {IComponentShowableUI} from '../../../../../core/ui/IComponentShowableUI';
import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import Point from '../../../../../utils/point/Point';
import UiUtils from '../../../../../utils/UiUtils';
import {EntityEvents} from '../../../../events/room/objects/entities/EntityEvents';
import {HumanEvents} from '../../../../events/room/objects/entities/HumanEvents';
import {UserEvents} from '../../../../events/room/objects/entities/UserEvents';
import {AvatarContainerData} from '../../../../events/ui/data/avatar/AvatarContainerData';
import {UIEvents} from '../../../../events/ui/UIEvents';
import {ChatData} from '../../../../game/chat/ChatData';
import {UIComponent} from '../../../../ui/components/UIComponent';
import {ActionId} from '../../../../ui/imagers/avatars/enum/actions/ActionId';
import AvatarData from '../../../../ui/imagers/avatars/enum/AvatarData';
import UserEntityVisualization from '../visualization/UserEntityVisualization';

export default class UserEntityLogic extends HumanLogic {
    private _typing = false;
    private _showLabel = false;

    private static SHOW_LABELS = false;

    public onDance(): void {}

    public registerEvents() {
        this.entity.visualization.container.on('pointerdown', () =>
            this.onClick()
        );
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

    public onToggleTyping(typing): void {
        this._typing = typing;
        this._showLabel = false;
    }

    public onTalk(length?: number): void {
        setTimeout(
            () => {
                const EntityVisualization = this._entity
                    .visualization as UserEntityVisualization;
                EntityVisualization.addAction(ActionId.TALK);
                EntityVisualization.needsUpdate = false;
                EntityVisualization.frame = 0;
                EntityVisualization.draw();
            },
            length ?? 100 * ChatData.SPEAK_SPEED
        );
    }

    public onMove(delta: number): void {
        const userVisualization = this.entity
            .visualization as UserEntityVisualization;

        if (userVisualization.actions.has(ActionId.WALK)) {
            userVisualization.move(delta);
        }
    }

    public onHover(): void {
        super.onHover();

        if (!UserEntityLogic.SHOW_LABELS) return;

        this._showLabel = !this._showLabel;
        this.toggleUI();
    }

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
                dimension.getY() / 2 +
                AvatarData.AVATAR_CONTAINER_OFFSET_LEFT,
            UiUtils.getGlobalPosition(this.entity.visualization?.container!)
                .ty -
                dimension.getX() +
                AvatarData.AVATAR_CONTAINER_OFFSET_TOP
        );

        EventManager.emit<AvatarContainerData>(
            UIEvents.AVATAR_CONTAINER_UPDATED,
            {
                label: this.entity.name,
                showLabel: this._showLabel,
                bounds: {
                    x: position.getX(),
                    y: position.getY(),
                    w: dimension.getY(),
                    h: dimension.getX(),
                },
                typing: this._typing,
            }
        );
    }

    public onPositionChanged() {}

    public onLoad(): void {
        this._showLabel = false;
    }

    public onClick() {
        const roomId = Engine.getInstance().roomService?.CurrentRoom?.id;
        const x = this.entity.position.getX();
        const y = this.entity.position.getY();

        Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.UserLookAtPoint,
            {
                roomId: roomId,
                x: x,
                y: y,
            }
        );

        super.onClick();
    }

    public figureChanged() {}
}
