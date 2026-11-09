import {ActionId} from '../../ui/imagers/avatars/enum/actions/ActionId';

/** Nitro's AvatarLogic: an expression lasts 3 s. */
const GESTURE_DURATION = 3000;
/** The laugh of the avatar menu (the server's UserAction): 1.6 s. */
const LAUGH_DURATION = 1600;

/** The expressions the server sends with a chat message (its ChatGesture, from the emoticons): how long they last. */
const DURATIONS = new Map<string, number>([
    [ActionId.SMILE, GESTURE_DURATION],
    [ActionId.SAD, GESTURE_DURATION],
    [ActionId.ANGRY, GESTURE_DURATION],
    [ActionId.SURPRISED, GESTURE_DURATION],
    [ActionId.LAUGH, LAUGH_DURATION],
]);

/**
 * The expression of a chat message, from its "gesture" (e.g. GestureSmile for ":)"): the action and for how long
 * it's shown. Null without one, or an unknown one.
 */
export function chatGesture(gesture?: string): {action: ActionId; duration: number} | null {
    const duration = gesture ? DURATIONS.get(gesture) : undefined;

    return duration ? {action: gesture as ActionId, duration} : null;
}
