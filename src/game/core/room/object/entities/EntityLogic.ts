import { Engine } from '../../../../Engine'
import { EntityEvents } from '../../../../engine/events/room/objects/entities/EntityEvents'
import { PreviewModeEventData } from '../../../../engine/events/ui/data/general/PreviewUserData'
import { UIEvents } from '../../../../engine/events/ui/UIEvents'
import { UIComponent } from '../../../../engine/ui/components/UIComponent'
import Point from '../../../../utils/point/Point'
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
        this.entity.visualization.container.on('pointerover', () => this.onHover())
    }

    public dispose(): void {
        Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.PreviewBoxUI).hide()
    }

    public onHover(): void {
        const tile = Engine.getInstance().roomService.CurrentRoom.roomLayout.getFloorPlane().getTilebyPosition(new Point(this.entity.position.getX(), this.entity.position.getY()))
        tile?.logic?.onHover()
    }

    public onClick(): void {
        const tile = Engine.getInstance().roomService.CurrentRoom.roomLayout.getFloorPlane().getTilebyPosition(new Point(this.entity.position.getX(), this.entity.position.getY()))
        tile?.logic?.onClick()
        this.togglePreview()
    }

    public async togglePreview() {
        if (Engine.getInstance().config.offlineMode)
            return;
        
        let isHuman = this.entity instanceof Human
        let mode = isHuman ? 'user' : 'item'
        Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.PreviewBoxUI).toggle()
        EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, {
            id: this.entity.id,
            mode: mode,
            name: this.entity.name,
            motto: "",
            image: (await UiUtils.generateImageFromObject(this.entity.visualization?.container!)).src
        })
    }

    abstract onMove?(delta: number): void

    public abstract onPositionChanged(): void

    public abstract onLoad(): void

    public get entity(): Entity {
        return this._entity
    }
}