export interface RoomData {
    id: number;
    name: string;
    desc: string;
    maxUsers: number;
    layout: string;
    door_x: number;
    door_y: number;
    users_count: number;
    owner_id: number;
    owner_name: string;
}
