import { ActionId } from "../../../../../engine/ui/imagers/avatars/enum/actions/ActionId"
import { Gender } from "../../../../../engine/ui/imagers/avatars/gamedata/IFigureData"
import { EntityType } from "../../../../room/object/entities/EntityType"

export interface IEntityData {
    id: number,
    user_id: number,
    gender: Gender,
    name: string,
    x: number,
    y: number,
    z: number,
    body_rot: string,
    rot: string,
    head_rot: string,
    type: EntityType
    look: string
    actions: ActionId[],

}