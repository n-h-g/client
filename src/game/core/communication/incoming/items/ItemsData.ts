export interface ItemData {
    id: string;
    baseName: string;
    item_type: string;
    name: string;
    room_id: string;
    x: number;
    y: number;
    z: number;
}

export interface ItemsData {
    data: ItemData[];
}
