export default interface IRoomLogic {
    tick(delta: number) : void   
    registerEvents(): void 
}