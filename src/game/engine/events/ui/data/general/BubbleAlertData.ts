/** A notification shown in the bubble alerts. */
export interface BubbleAlertData {
    message: string;
    /** With an action the alert shows Accetta/Rifiuta and stays until one is clicked, else it goes away by itself. */
    action?: {
        onConfirm: () => void;
        onDecline: () => void;
    };
}
