import Item from '../../engine/room/objects/items/Item'
import { IRepository } from '../IRepository'

export interface RoomItemRepository extends IRepository<string, Item> {
    movingItem: Item
}