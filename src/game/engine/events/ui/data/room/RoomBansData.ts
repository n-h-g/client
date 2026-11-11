/** A user banned from the room: until expiresAt (ISO date of the server), or forever (null). */
export type RoomBan = {
    userId: number;
    username: string;
    expiresAt: string | null;
};

export type RoomBansData = {
    bans: RoomBan[];
};
