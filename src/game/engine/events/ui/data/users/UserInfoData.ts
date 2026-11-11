/** The card of a user in the room (server's UserInfo). */
export interface UserInfoData {
    userId: number;
    motto: string;
    /** The codes of the worn badges, in the order of their slots. */
    badges: string[];
}
