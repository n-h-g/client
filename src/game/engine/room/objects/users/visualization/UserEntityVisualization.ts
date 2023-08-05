import { UserEntity } from '../UserEntity'
import { HumanVisualization } from '../../../../../core/room/object/human/visualization/HumanVisualization'

export default class UserEntityVisualization extends HumanVisualization {
    constructor(entity: UserEntity) {
        super(entity)
        this._actions = new Set()
    }
}