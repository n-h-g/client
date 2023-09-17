export class AnimationFrame {
    private _id: number;

    private _repeats = 0;

    constructor(id: number, repeats: number) {
        if (repeats < 1) repeats = 1;

        if (repeats < 0) repeats = -1;

        this._id = id;
        this._repeats = repeats;
    }

    get repeats(): number {
        return this._repeats;
    }

    get id(): number {
        return this._id;
    }

    repeatsForever() {
        return this._repeats == -1;
    }
}
