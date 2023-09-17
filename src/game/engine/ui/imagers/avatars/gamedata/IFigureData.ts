export default interface IFigureData {
    palette: {[key: string]: {[key: string]: IPaletteColor}};
    settype: {[key: string]: CA};
}

export interface IPaletteColor {
    index: number;
    club: number;
    selectable: boolean;
    color: string;
}

export interface CA {
    paletteid: number;
    mand_m_0: boolean;
    mand_m_1: boolean;
    mand_f_0: boolean;
    mand_f_1: boolean;
    set: {[key: string]: ISet};
}

export interface ISet {
    gender: Gender;
    club: number;
    colorable: boolean;
    selectable: boolean;
    preselectable: boolean;
    sellable: boolean;
    legacy: boolean;
    parts: IPart[];
    hidden?: string[];
}

export enum Gender {
    F = 'F',
    M = 'M',
    U = 'U',
}

// part color
export interface IPart {
    type: string;
    id: number;
    colorable: boolean;
    index: number;
    colorindex: number;
}
