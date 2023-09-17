export class AnimationFrame {

    constructor(public readonly id: number, public readonly repeats: number) {
        if (repeats < 1) repeats = 1;

        if (repeats < 0) repeats = -1;

        this.repeats = repeats;
    }

    repeatsForever() {
        return this.repeats == -1;
    }
}
