import { IComponentUI } from "./IComponentUI"

export interface IComponentShowableUI extends IComponentUI {
    hide(): void
    show(): void
}