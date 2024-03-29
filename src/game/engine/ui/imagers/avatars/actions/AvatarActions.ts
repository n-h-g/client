import {ActionId} from '../enum/actions/ActionId';
import {AvatarActionId} from '../enum/actions/AvatarActionId';
import {AvatarActions, IAction} from '../gamedata/IAvatarActions';
import {Action} from './Action';

export class Actions {
    private actions: Map<string, Action>;

    constructor(actionsData: AvatarActions) {
        this.actions = new Map();

        this.loadActions(actionsData.actions);
    }

    getDefaultAction(): Action | null {
        for (const action of this.actions.values()) {
            if (action.isDefault == true) {
                return action;
            }
        }

        return null;
    }

    getActionsByIds(actionIds: Set<ActionId>): Action[] {
        const actions: Action[] = [];

        const avatarActions: IterableIterator<Action> = this.actions.values();

        actionIds.forEach(id => {
            for (const action of avatarActions) {
                if (action.id == id) {
                    actions.push(action);
                }
            }
        });

        return actions;
    }

    private sortByPrecedence(actionOne: Action, actionTwo: Action): number {
        if (!actionOne || !actionTwo) return 0;

        const precedenceOne = actionOne.precedence;
        const precedenceTwo = actionTwo.precedence;

        if (precedenceOne < precedenceTwo) return 1;

        if (precedenceOne > precedenceTwo) return -1;

        return 0;
    }

    getActionByState(state: string): Action | null {
        const action = this.actions.get(state) as Action;

        if (!action) return null;

        return action;
    }

    getActionById(id: ActionId): Action | null {
        const state: string = AvatarActionId.idToAvatarActionState(id);
        return this.getActionByState(state);
    }

    private loadActions(actions: IAction[]): void {
        if (actions && actions.length > 0) {
            for (const action of actions) {
                const newAction = new Action(action);
                this.actions.set(newAction.state, newAction);
            }
        }
    }
}
