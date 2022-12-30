import { IAsset } from "../IAsset";
import { IDimension } from "../IDimension";
import { ILogic } from "../ILogic";
import { IVisualization } from "../IVisualization";
import { FloorItemDescription } from "./IFloorItemDescription";
import { WallItemDescription } from "./IWallItemDescription";

export interface IFurnidata {
    type: string;
    name: string;
    visualizationType: string;
    logicType: string;
    spritesheet: string;
    dimensions: IDimension;
    assets: { [key: string] : IAsset };
    visualization: IVisualization;
    logic: ILogic,
}

export type Furnidata = {
    roomitemtypes: { //todo change to flooritemtypes
        [id: number]: FloorItemDescription
    },
    wallitemtypes: {
        [id: number]: WallItemDescription
    }
};

export type FurniDescription = FloorItemDescription | WallItemDescription;

