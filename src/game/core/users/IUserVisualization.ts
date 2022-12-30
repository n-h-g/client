import User from "../../engine/user/User"
import Entity from "../room/object/entities/Entity"

export default interface IUserVisualization {   
    render(): void

    userEntity: Entity | null

    user: User
}