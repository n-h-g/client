import {Engine} from '../../../../Engine';
import {EntityEvents} from '../../../../engine/events/room/objects/entities/EntityEvents';
import {PreviewModeEventData} from '../../../../engine/events/ui/data/general/PreviewUserData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {UIComponent} from '../../../../engine/ui/components/UIComponent';
import {Point} from '../../../../utils/point/Point';
import {UiUtils} from '../../../../utils/UiUtils';
import {EventManager} from '../../../events/EventManager';
import {IComponentShowableUI} from '../../../ui/IComponentShowableUI';
import {Human} from '../human/Human';
import {RoomObjectLogic} from '../RoomObjectLogic';
import {Entity} from './Entity';
import type {Container, FederatedPointerEvent} from 'pixi.js';

export abstract class EntityLogic extends RoomObjectLogic {
    protected entity: Entity;
    protected frameTracker = 0;

    constructor(entity: Entity) {
        super();
        this.entity = entity;
    }

    private listenedContainer: Container | null = null;
    private logicEventsRegistered = false;

    /**
     * Called at every render of the entity: the mouse listeners are added once per container,
     * the logic events once per entity (they used to pile up, and a click opened and closed the preview).
     */
    registerEvents(): void {
        const container = this.entity.visualization.container;

        if (container && container !== this.listenedContainer) {
            this.listenedContainer = container;
            container.on('pointerdown', event => this.onClick(event));
            container.on('pointerover', () => this.onHover());
        }

        if (this.logicEventsRegistered) return;
        this.logicEventsRegistered = true;

        this.registerLogicEvents();
    }

    /**
     * Listeners of the logic events (this.events), registered only once.
     */
    protected registerLogicEvents(): void {
        this.events.on(EntityEvents.POSITION_CHANGED, () =>
            this.onPositionChanged()
        );
    }

    dispose(): void {
        Engine.getInstance()
            .userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(
                UIComponent.PreviewBoxUI
            )
            .hide();
    }

    onHover(): void {
        // The floor pointer is handled by RoomLogic (tile under the mouse),
        // it must not jump to the entity origin tile when the mouse is over an entity.
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClick(event?: FederatedPointerEvent): void {
        const tile = Engine.getInstance()
            .roomService.currentRoom.roomLayout.getFloorPlane()
            .getTilebyPosition(
                new Point(
                    this.entity.position.x,
                    this.entity.position.y
                )
            );
        tile?.logic?.onClick();
        this.togglePreview();
    }

    async loadPreviewData(mode) {
        // a user (UserEntity): its card asks the server its motto and badges
        const user = this.entity as {userId?: number | null; isBot?: boolean; figure?: string};
        const userId = user.isBot ? null : user.userId ?? null;

        EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, {
            id: this.entity.id,
            mode: mode,
            name: this.entity.name,
            motto: '',
            userId,
            isSelf: userId != null && userId === Engine.getInstance().currentUserId,
            look: user.figure,
            image: (
                await UiUtils.generateImageFromObject(
                    this.entity.visualization?.container!
                )
            ).src,
        });
    }

    async togglePreview() {
        if (Engine.getInstance().config.offlineMode) return;

        const isHuman = this.entity instanceof Human;
        const mode = isHuman ? 'user' : 'item';
        // show, not toggle: clicking another entity while the preview is open must not close it
        Engine.getInstance()
            .userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(
                UIComponent.PreviewBoxUI
            )
            .show();

            await this.loadPreviewData(mode)
    }

    abstract onMove?(delta: number): void;

    abstract onPositionChanged(): void;

    abstract onLoad(): void;
}
