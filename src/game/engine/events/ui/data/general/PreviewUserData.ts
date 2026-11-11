export type PreviewModeEventData = {
    id: string;
    mode: string;
    name: string;
    motto?: string;
    image: string;
    /** A user (not a bot): its id, to ask its motto and badges. */
    userId?: number | null;
    /** The avatar of the user itself: it can change its motto. */
    isSelf?: boolean;
    look?: string;
    /** A pet (mode 'pet'): its type (0 dog, 1 cat...), the scratches it got and its owner, if known. */
    petType?: number;
    petRespects?: number;
    petOwner?: string;
};
