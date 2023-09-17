import {IRepository} from './IRepository';

export class Repository<S, T> implements IRepository<S, T> {
    private _map: Map<S, T>;

    public constructor() {
        this._map = new Map();
    }

    public get(s: S): T {
        const value = this._map.get(s);

        if (!value) return null;

        return value;
    }

    public delete(a: S): boolean {
        return this._map.delete(a);
    }

    public add(t: S, b: T): void {
        this._map.set(t, b);
    }

    public has(a: S): boolean {
        return this._map.has(a);
    }

    public create<S, T>(): Map<S, T> {
        return new Map<S, T>();
    }

    public getAll(): Map<S, T> {
        return this._map;
    }

    public tick(delta: number): void {}
}
