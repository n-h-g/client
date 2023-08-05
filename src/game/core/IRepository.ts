export interface IRepository<S, T> {
    get(a: S): T
    delete(a: S): boolean
    add(s: S, b: T): void
    has(a: S): boolean
    create<S, T>(): Map<S, T>
    getAll(): Map<S, T>
    tick(delta: number): void
}