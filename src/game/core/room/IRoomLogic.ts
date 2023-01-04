export interface IRoomLogic {
    tick(delta: number): void
    registerEvents(): void
}