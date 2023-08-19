import { Engine } from '../../../../Engine'
import { EntityEvents } from '../../../../engine/events/room/objects/entities/EntityEvents'
import { PreviewModeEventData } from '../../../../engine/events/ui/data/general/PreviewUserData'
import { UIEvents } from '../../../../engine/events/ui/UIEvents'
import { UIComponent } from '../../../../engine/ui/components/UIComponent'
import UiUtils from '../../../../utils/UiUtils'
import { EventManager } from '../../../events/EventManager'
import { IComponentShowableUI } from '../../../ui/IComponentShowableUI'
import { Human } from '../human/Human'
import { RoomObjectLogic } from '../RoomObjectLogic'
import { Entity } from "./Entity"

export abstract class EntityLogic extends RoomObjectLogic {
    protected _entity: Entity
    
    protected frameTracker: number = 0

    public constructor(entity: Entity) {
        super()
        this._entity = entity
    }

    public registerEvents(): void {
        this.events.on(EntityEvents.POSITION_CHANGED, () => this.onPositionChanged())
        this.entity.visualization.container.on('pointerdown', () => this.onClick())
    }

    public dispose(): void {
        (Engine.getInstance().userInterfaceManager.componentsManager.getComponent(UIComponent.PreviewBoxUI) as IComponentShowableUI).hide()
    }

    public onHover(): void {
        console.log('hover')
    }

    public onClick(): void {
        this.togglePreview()
    }

    public togglePreview() {
        let entity: Entity = this.entity

        let isHuman = entity instanceof Human

        let mode = isHuman ? "user" : "item"

        Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.PreviewBoxUI).toggle()

        EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, {
            id: entity.id,
            mode: mode,
            name: entity.name,
            motto: "",
            image: UiUtils.generateImageFromObject(this.entity.visualization?.container!).src
        })
    }

    abstract onMove?(delta: number): void

    public abstract onPositionChanged(): void

    public abstract onLoad(): void

    public get entity(): Entity {
        return this._entity
    }
}