
import { ActionId } from "../enum/actions/ActionId";
import { GeometryType } from "../enum/geometry/GeometryType";
import { IAction, IActionType } from "../gamedata/IAvatarActions";

export default class Action {

    public id: ActionId;
    public state: string;
    public precedence: number;
    public main: boolean;
    
    public geometryType: string

    public activePartSet: string
    public assetPartDefiniton: string

    public prevents: string[];

    public isDefault: boolean | undefined

    public lay: string

    public preventHeadTurn: boolean | undefined

    public types: IActionType[]

    public constructor(actionData: IAction) {
        this.id = actionData.id as ActionId
        this.state = actionData.state;
        this.precedence = actionData.precedence;
        this.assetPartDefiniton = actionData.assetPartDefinition;
        this.activePartSet = actionData.activePartSet;
        this.main = actionData.main;
        this.geometryType = actionData.geometryType as GeometryType;
        this.prevents = actionData.prevents
        this.isDefault = actionData.isDefault;
        this.lay = actionData.lay;
        this.preventHeadTurn = actionData.preventHeadTurn;
        this.types = actionData.types;
    }
}