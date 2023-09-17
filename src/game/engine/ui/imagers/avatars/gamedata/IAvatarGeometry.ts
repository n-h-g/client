export default interface IAvatarGeometry {
    geometry: IGeometry;
}

export interface IGeometry {
    direction: number;
    camera: ICamera;
    canvases: ICanvas[];
    avatarSets: IGeometryAvatarSet[];
    types: IType[];
}

//TODO: remove ?
export interface ICamera {
    x: number;
    y: number;
    z: number;
}

export interface ICanvas {
    scale: string;
    geometries: IGeometryElement[];
}

export interface IGeometryElement {
    id: string;
    width: number;
    height: number;
    dx: number;
    dy: number;
}

export interface IGeometryAvatarSet {
    id: string;
    avatarSets: IAvatarSetAvatarSet[];
}

export interface IAvatarSetAvatarSet {
    id: string;
    main?: boolean;
    bodyParts: IAvatarSetBodyPart[];
}

export interface IAvatarSetBodyPart {
    id: string;
    radius: number;
    x: number;
    y: number;
    z: number;
}

export interface IType {
    id: string;
    bodyParts: ITypeBodyPart[];
}

export interface ITypeBodyPart {
    id: string;
    x: number;
    y: number;
    z: number;
    radius: number;
    items?: Item[];
}

export interface Item {
    id: string;
    x: number;
    y: number;
    z: number;
    radius: number;
    nx: number;
    ny: number;
    nz: number;
    double: boolean;
}
