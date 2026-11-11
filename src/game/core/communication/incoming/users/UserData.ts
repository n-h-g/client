export interface UserData {
    id: number;
    username: string;
    look: string;
    gender: string;
    motto: string;
    /** The style of the chat bubbles it picked. */
    chatStyle?: number;
    /** The pets it can still scratch today. */
    petRespects?: number;
    online: boolean;
    credits: number;
}
