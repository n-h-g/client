import { IActionsComponent } from "../../../../room/object/entities/components/IActionsComponent"
import { IAspectComponent } from "../../../../room/object/entities/components/IAspectComponent"
import { IHeadBodyRotationComponent } from "../../../../room/object/entities/components/IHeadBodyRotation"
import { IPositionComponent } from "../../../../room/object/entities/components/IPositionComponent"
import { IUserComponent } from "../../../../room/object/entities/components/IUserComponent"
import { EntityType } from "../../../../room/object/entities/EntityType"

export interface IEntityData {
    id: string
    user: IUserComponent
    aspect: IAspectComponent
    name: {
        name: string
    }
    rotation: {
        rot: number
    }
    position: IPositionComponent
    bh_rot: IHeadBodyRotationComponent
    type: EntityType
    action: IActionsComponent
}