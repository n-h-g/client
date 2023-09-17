import {IRepository} from './IRepository';

export class Repository<S, T> implements IRepository<S, T> {
    private map: Map<S, T>;

    constructor() {
        this.map = new Map();
    }

    get(s: S): T {
        const value = this.map.get(s);

        if (!value) return null;

        return value;
    }

    delete(a: S): boolean {
        return this.map.delete(a);
    }

    add(t: S, b: T): void {
        this.map.set(t, b);
    }

    has(a: S): boolean {
        return this.map.has(a);
    }

    create<S, T>(): Map<S, T> {
        return new Map<S, T>();
    }

    getAll(): Map<S, T> {
        return this.map;
    }

    tick(delta: number): void {}
}
