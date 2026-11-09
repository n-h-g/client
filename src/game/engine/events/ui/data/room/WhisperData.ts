/** The user chooses who to whisper to (avatar menu): the chat bar whispers to it until it's closed. */
export type WhisperData = {
    /** The username, empty to talk to the room again. */
    username: string;
};
