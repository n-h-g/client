import { IComponentUI } from "./IComponentUI"

export interface IComponentShowableUI extends IComponentUI {
    visible: boolean
    hide(): void
    show(): void
    toggle(): void
}