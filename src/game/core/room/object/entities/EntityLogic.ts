import { EntityEvents } from '../../../../engine/events/room/objects/entities/EntityEvents';
import { DialogEventData } from '../../../../engine/events/ui/data/general/Dialog';
import { PreviewModeEventData } from '../../../../engine/events/ui/data/general/PreviewUserData';
import { UIEvents } from '../../../../engine/events/ui/UIEvents';
import { UIEventsType } from '../../../../engine/events/ui/UIEventsType';
import UiUtils from '../../../../utils/UiUtils';
import { EventManager } from '../../../events/EventManager';
import Human from '../human/Human';
import { RoomObjectLogic } from '../RoomObjectLogic';
import { Entity } from "./Entity";

export abstract class EntityLogic extends RoomObjectLogic {
    protected _entity: Entity
    
    protected frameTracker: number = 0

    private preview: HTMLImageElement

    public constructor(entity: Entity) {
        super()
        this._entity = entity
    }

    public registerEvents(): void {
        this.events.on(EntityEvents.POSITION_CHANGED, () => this.onPositionChanged())
        this.events.on(EntityEvents.LOAD_COMPLETE, () => this.onLoad())
        this.entity.visualization.container.on('pointerdown', () => this.onClick())
    }

    private async generateImages() {
        this.preview = await UiUtils.generateImageFromObject(this.entity.visualization.container)
    }

    public dispose(): void {
        
    }

    public onHover(): void {
        console.log('hover')
    }

    public onClick(): void {

        console.log(this._entity.visualization.container)

        this.togglePreview()
    }

    public togglePreview() {
        let entity: Entity = this.entity

        let isHuman = entity instanceof Human

        let mode = isHuman ? "user" : "item"

        EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, {
            id: entity.id,
            mode: mode,
            name: entity.name,
            motto: "dsds",
            image: this.preview.src
        })
        EventManager.emit<DialogEventData>(UIEvents.OPEN, {
            type: UIEventsType.PREVIEWBOX
        })
    }
    abstract onMove?(delta: number): void

    public  onPositionChanged(){
        console.log('dasd')
    }

    public async onLoad(){
        this.generateImages()
    }

    public get entity(): Entity {
        return this._entity
    }
}