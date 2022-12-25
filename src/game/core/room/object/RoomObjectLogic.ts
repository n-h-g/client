import IRoomObjectLogic from "./IRoomObjectLogic"

export default abstract class RoomObjectLogic implements IRoomObjectLogic {

    abstract tick(delta: number) : void

    abstract registerEvents() : void

    abstract onClick(): void

    abstract onHover?(): void

    abstract onMove?(delta: number): void
}