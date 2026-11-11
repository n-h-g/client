export interface RoomMessageData {
    authorId: string;
    text: string;
    /** A whisper: only the author and the recipient see it. */
    whisper?: boolean;
    /** The username the whisper is for. */
    recipient?: string;
    /** The expression of the emoticon of the message (e.g. GestureSmile for ":)"), sent by the server. */
    gesture?: string;
    /** The style of the bubble of the author. */
    style?: number;
}
