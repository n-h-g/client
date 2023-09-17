export interface AvatarActions {
    actions: IAction[];
}

export interface IAction {
    id: string;
    state: string;
    precedence: number;
    main: boolean;
    geometryType: string;
    activePartSet: string;
    assetPartDefinition: string;
    prevents: string[];
    animation?: boolean;
    startFromFrameZero?: boolean;
    preventHeadTurn?: boolean;
    types: IActionType[];
    params: Param[];
    lay: string;
    isDefault?: boolean;
}

export interface IActionType {
    id: any;
    animated: boolean;
    prevents: string[];
    preventHeadTurn?: boolean;
}

export interface Param {
    id: string;
    value: string;
}
