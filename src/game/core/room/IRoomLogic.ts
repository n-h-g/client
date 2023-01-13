import { IDisposable } from "./IDisposable"

export interface IRoomLogic extends IDisposable {
    tick(delta: number): void
    registerEvents(): void
}