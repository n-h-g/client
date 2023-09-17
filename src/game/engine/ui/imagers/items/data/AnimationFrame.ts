export class AnimationFrame {
    private _id: number;

    private _repeats = 0;

    public constructor(id: number, repeats: number) {
        if (repeats < 1) repeats = 1;

        if (repeats < 0) repeats = -1;

        this._id = id;
        this._repeats = repeats;
    }

    public get repeats(): number {
        return this._repeats;
    }

    public get id(): number {
        return this._id;
    }

    public repeatsForever() {
        return this._repeats == -1;
    }
}
