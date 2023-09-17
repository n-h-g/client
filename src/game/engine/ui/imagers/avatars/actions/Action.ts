import {ActionId} from '../enum/actions/ActionId';
import {AvatarActionId} from '../enum/actions/AvatarActionId';
import {GeometryType} from '../enum/geometry/GeometryType';
import {IAction, IActionType} from '../gamedata/IAvatarActions';

export class Action {
    id: ActionId;
    state: string;
    precedence: number;
    main: boolean;

    geometryType: string;

    activePartSet: string;
    assetPartDefiniton: string;

    prevents: string[];

    isDefault: boolean | undefined;

    lay: string;

    preventHeadTurn: boolean | undefined;

    types: IActionType[];

    constructor(actionData: IAction) {
        this.id = actionData.id as ActionId;
        this.state = actionData.state;
        this.precedence = actionData.precedence;
        this.assetPartDefiniton = actionData.assetPartDefinition;
        this.activePartSet = actionData.activePartSet;
        this.main = actionData.main;
        this.geometryType = actionData.geometryType as GeometryType;
        this.prevents = actionData.prevents;
        this.isDefault = actionData.isDefault;
        this.lay = actionData.lay;
        this.preventHeadTurn = actionData.preventHeadTurn;
        this.types = actionData.types;
    }

    getActionStateName() {
        return AvatarActionId.idToAvatarActionState(this.id);
    }
}
