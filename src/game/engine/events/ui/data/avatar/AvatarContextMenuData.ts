export type AvatarContextMenuData = {
    id: string;
    name: string;
    x: number;
    y: number;
    sitting: boolean;
    isSelf: boolean;
    /** Id of the user of the avatar (for the friendship request), null for a bot. */
    userId?: number | null;
};
