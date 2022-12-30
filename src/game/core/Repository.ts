import { IRepository } from "./IRepository";

export default class Repository<S, T> implements IRepository<S, T> {
    public map: Map<S, T>

    public constructor() {
        this.map = new Map();
    }

    public has(a: S): boolean {
        return this.map.has(a)
    }

    public delete(a: S): boolean {
        return this.map.delete(a)
    }
    public add(t: S, b: T): void {
        this.map.set(t, b)
    }
    public create<S, T>(): Map<S, T> {
        return new Map<S, T>();
    }
    public getAll(): Map<S, T> {
        return this.map;
    }

    public get(s: S): T | null {
        const value = this.map.get(s)

        if(!value) return null;

        return value;
    }

    public tick(delta: number): void {}
}