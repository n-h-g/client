import { IComponentUI } from "./IComponentUI";

export interface IComponentDeletableUI extends IComponentUI {
    delete(): void
}