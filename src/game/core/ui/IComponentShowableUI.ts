import { IComponentUI } from "./IComponentUI"

export interface IComponentShowableUI extends IComponentUI {
    toggle(): void
    hide(): void
    show(): void
}