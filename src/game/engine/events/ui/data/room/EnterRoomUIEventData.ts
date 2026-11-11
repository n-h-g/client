export type EnterRoomUIEventData = {
    name: string;
    description: string;
    owner: string;
    haveRights: boolean;
    maxUsers?: number;
    /** 0 open, 1 with the doorbell (RoomDoorMode). */
    doorMode?: number;
    hideWalls?: boolean;
    wallThickness?: number;
    floorThickness?: number;
};
