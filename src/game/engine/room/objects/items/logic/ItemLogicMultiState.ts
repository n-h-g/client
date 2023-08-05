import { ItemLogic } from '../../../../../core/room/object/items/logic/ItemLogic'
import Item from '../Item'

export default class ItemLogicMultiState extends ItemLogic {
    constructor(item: Item) {
        super(item)
    }

    public registerEvents() {
        super.registerEvents()
    }

    public changeState() {

    }

    public tick(delta: number) {
        
    }
}