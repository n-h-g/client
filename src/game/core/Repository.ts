import {IRepository} from './IRepository';

export class Repository<S, T> implements IRepository<S, T> {
    private _map: Map<S, T>;

    constructor() {
        this._map = new Map();
    }

    get(s: S): T {
        const value = this._map.get(s);

        if (!value) return null;

        return value;
    }

    delete(a: S): boolean {
        return this._map.delete(a);
    }

    add(t: S, b: T): void {
        this._map.set(t, b);
    }

    has(a: S): boolean {
        return this._map.has(a);
    }

    create<S, T>(): Map<S, T> {
        return new Map<S, T>();
    }

    getAll(): Map<S, T> {
        return this._map;
    }

    tick(delta: number): void {}
}
