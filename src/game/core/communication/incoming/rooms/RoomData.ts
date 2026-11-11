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
    description?: string;
    max_users?: number;
    /** 0 open, 1 with the doorbell. */
    door_mode?: number;
    /** Decorations applied with the wallpaper/floor/landscape items ("0.0" = default look). */
    wallpaper?: string;
    floor?: string;
    landscape?: string;
    /** The look of the room (the "Customize" settings): thickness -2 thinnest, -1 thin, 0 normal, 1 thick. */
    hide_walls?: boolean;
    wall_thickness?: number;
    floor_thickness?: number;
}
