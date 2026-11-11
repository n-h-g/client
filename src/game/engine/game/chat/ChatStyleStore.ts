/**
 * The style of the chat bubbles of the user (the picker next to the chat bar): sent with each message, the server
 * keeps it for the next login (UpdateUserInformation brings it back).
 */
export class ChatStyleStore {
    /**
     * The styles the users can pick (Nitro's chat.styles without the system and staff ones; the HC ones are for
     * everybody, there is no HC yet). The server checks it again (ChatStyle).
     */
    static readonly SELECTABLE = [
        0, 3, 4, 5, 6, 7,
        9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        24, 25, 26, 27, 28, 29,
        32, 35, 36, 38,
    ];

    private static style = 0;
    private static listeners = new Set<(style: number) => void>();

    static get current(): number {
        return this.style;
    }

    static set(style: number): void {
        if (!ChatStyleStore.SELECTABLE.includes(style)) style = 0;
        if (style === this.style) return;

        this.style = style;
        this.listeners.forEach(listener => listener(style));
    }

    /** @returns a function that removes the listener. */
    static subscribe(listener: (style: number) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}
