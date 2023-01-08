import { EntityEvents } from '../../../../engine/events/room/objects/entities/EntityEvents';
import { DialogEventData } from '../../../../engine/events/ui/data/general/Dialog';
import { PreviewModeEventData } from '../../../../engine/events/ui/data/general/PreviewUserData';
import { UIEvents } from '../../../../engine/events/ui/UIEvents';
import { UIEventsType } from '../../../../engine/events/ui/UIEventsType';
import UiUtils from '../../../../utils/UiUtils';
import { EventManager } from '../../../events/EventManager';
import { RoomObjectLogic } from '../RoomObjectLogic';
import { Entity } from "./Entity";

export abstract class EntityLogic extends RoomObjectLogic {
    protected _entity: Entity
    
    protected frameTracker: number = 0

    public constructor(entity: Entity) {
        super()
        this._entity = entity
    }

    public registerEvents(): void {
        this.events.on(EntityEvents.POSITION_CHANGED, () => this.onPositionChanged())
    }

    public onClick(): void {
        this.togglePreview()
    }

    public togglePreview() {
        let entity: Entity = this.entity
        EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, {
            mode: 'user',
            name: entity.name,
            motto: "dsds",
            image: UiUtils.generateImageFromObject(this.entity.visualization?.container!).src
        })
        EventManager.emit<DialogEventData>(UIEvents.OPEN, {
            type: UIEventsType.PREVIEWBOX
        })
    }

    public abstract onPositionChanged(): void

    public abstract onLoad(): void

    public get entity(): Entity {
        return this._entity
    }
}