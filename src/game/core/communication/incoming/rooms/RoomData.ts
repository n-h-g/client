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
    /** Decorations applied with the wallpaper/floor/landscape items ("0.0" = default look). */
    wallpaper?: string;
    floor?: string;
    landscape?: string;
}
