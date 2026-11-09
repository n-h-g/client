/** A part of a pet changed by the user (Nitro's PetCustomPart): e.g. the hair or the saddle of a horse. */
export type PetCustomPart = {
    /** The layer of the library it replaces (0 = a, 1 = b...). */
    layerId: number;
    /** The asset of the part: <asset>_<partId>, -1 the normal asset of the layer. */
    partId: number;
    /** Its palette, -1 the palette of the pet. */
    paletteId: number;
};

/**
 * The look of a pet (Nitro's PetFigureData), from its figure string:
 * "<type> <palette> <color hex> [head] [<parts count> <layer> <part> <palette>...]",
 * e.g. "0 3 ffffff" a dog with palette 3, "15 2 ffffff 1 4 2 -1" a horse with the part 2 on the layer e (4).
 */
export class PetFigureData {
    readonly typeId: number;
    readonly paletteId: number;
    /** The tint of all the layers (0xffffff: the colors of the palette). */
    readonly color: number;
    /** Only the head (e.g. the pets in the chat). */
    readonly headOnly: boolean;
    readonly customParts: PetCustomPart[];

    constructor(typeId: number, paletteId: number, color: number, headOnly = false, customParts: PetCustomPart[] = []) {
        this.typeId = typeId;
        this.paletteId = paletteId;
        this.color = color;
        this.headOnly = headOnly;
        this.customParts = customParts;
    }

    static fromString(figure: string): PetFigureData {
        const parts = (figure ?? '').trim().split(/\s+/);
        const number = (value: string | undefined, fallback: number, radix = 10) => {
            const parsed = parseInt(value ?? '', radix);
            return isNaN(parsed) ? fallback : parsed;
        };

        const headOnly = parts[3] === 'head';
        // after "head" (if any): the count of the custom parts and 3 numbers for each one
        const countIndex = headOnly ? 4 : 3;
        const count = number(parts[countIndex], 0);
        const customParts: PetCustomPart[] = [];

        for (let i = 0; i < count; i++) {
            const start = countIndex + 1 + i * 3;
            if (start + 2 >= parts.length) break;

            customParts.push({
                layerId: number(parts[start], -1),
                partId: number(parts[start + 1], -1),
                paletteId: number(parts[start + 2], -1),
            });
        }

        return new PetFigureData(number(parts[0], 0), number(parts[1], 0), number(parts[2], 0xffffff, 16), headOnly, customParts);
    }

    /** A pet of the inventory or of the server: its type, its race (the palette) and its color (hex, e.g. "ffffff"). */
    static from(type: number, race: number, color?: string | number | null): PetFigureData {
        const tint = typeof color === 'number' ? color : parseInt(String(color ?? '').replace('#', ''), 16);

        return new PetFigureData(type, race, isNaN(tint) ? 0xffffff : tint);
    }

    /** The same pet with only its head. */
    withHeadOnly(headOnly = true): PetFigureData {
        return new PetFigureData(this.typeId, this.paletteId, this.color, headOnly, this.customParts);
    }

    getCustomPart(layerId: number): PetCustomPart | null {
        return this.customParts.find(part => part.layerId === layerId) ?? null;
    }

    get figureString(): string {
        let figure = `${this.typeId} ${this.paletteId} ${this.color.toString(16)}`;
        if (this.headOnly) figure += ' head';
        if (this.customParts.length) {
            figure += ` ${this.customParts.length}`;
            for (const part of this.customParts) figure += ` ${part.layerId} ${part.partId} ${part.paletteId}`;
        }
        return figure;
    }
}
