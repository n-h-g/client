export abstract class RoomObjectLogic {
    abstract tick(delta: number): void

    abstract registerEvents(): void

    abstract onClick(): void

    abstract onHover?(): void

    abstract onMove?(delta: number): void
}