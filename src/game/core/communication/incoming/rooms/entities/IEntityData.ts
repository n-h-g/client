import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId"
import { Gender } from "../../../../../engine/ui/imagers/avatars/gamedata/IFigureData"
import { EntityType } from "../../../../room/object/entities/EntityType"

export interface IEntityData {
    id: string
    user: {
        id: number
    }
    aspect: {
        gender: Gender,
        look: string
    }
    name: string
    position: {
        x: number
        y: number
        z: number
    }
    bh_rot: {
        body_rot: number,
        head_rot: number
    }
    type: EntityType
    actions: ActionId[]
}