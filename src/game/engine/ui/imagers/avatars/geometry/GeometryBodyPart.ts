import { Item, ITypeBodyPart } from "../gamedata/IAvatarGeometry";
import GeometryItem from "./GeometryItem";

export default class GeometryBodyPart {
    public id: string;
    private items: Map<string, GeometryItem> 

    public constructor(bodyPart: ITypeBodyPart) {
        this.id = bodyPart.id;
        this.items = new Map();
    
        if(bodyPart.items)
            this.loadItems(bodyPart.items)
    } 

    public getPartIds(): string[] {
        const ids: string[] = []

        for(let part of this.items.values()) {
            if(!part) continue;

            ids.push(part.id)
        }

        return ids;
    }

    private loadItems(items: Item[]) {
        if(items && items.length > 0) {
            for(let item of items) {
                
                const newItem = new GeometryItem(item);

                this.items.set(newItem.id, newItem)
            }
        }
    }
}