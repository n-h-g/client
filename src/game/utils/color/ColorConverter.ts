/**
 * RGB <-> HSL as Nitro's ColorConverter: the colors are numbers 0xRRGGBB and 0xHHSSLL (each part 0-255).
 */
export class ColorConverter {
    static rgbToHSL(rgb: number): number {
        const r = ((rgb >> 16) & 0xff) / 0xff;
        const g = ((rgb >> 8) & 0xff) / 0xff;
        const b = (rgb & 0xff) / 0xff;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;

        let hue = 0;
        if (delta !== 0) {
            if (max === r) hue = g > b ? (60 * (g - b)) / delta : (60 * (g - b)) / delta + 360;
            else if (max === g) hue = (60 * (b - r)) / delta + 120;
            else hue = (60 * (r - g)) / delta + 240;
        }

        const lightness = 0.5 * (max + min);
        let saturation = 0;
        if (delta !== 0) saturation = lightness <= 0.5 ? (delta / lightness) * 0.5 : (delta / (1 - lightness)) * 0.5;

        return (Math.round((hue / 360) * 0xff) << 16) + (Math.round(saturation * 0xff) << 8) + Math.round(lightness * 0xff);
    }

    static hslToRGB(hsl: number): number {
        const hue = ((hsl >> 16) & 0xff) / 0xff;
        const saturation = ((hsl >> 8) & 0xff) / 0xff;
        const lightness = (hsl & 0xff) / 0xff;

        let r = lightness;
        let g = lightness;
        let b = lightness;

        if (saturation > 0) {
            const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
            const p = 2 * lightness - q;

            const channel = (t: number): number => {
                if (t < 0) t += 1;
                else if (t > 1) t -= 1;

                if (t * 6 < 1) return p + (q - p) * 6 * t;
                if (t * 2 < 1) return q;
                if (t * 3 < 2) return p + (q - p) * 6 * (2 / 3 - t);
                return p;
            };

            r = channel(hue + 1 / 3);
            g = channel(hue);
            b = channel(hue - 1 / 3);
        }

        return (Math.round(r * 0xff) << 16) + (Math.round(g * 0xff) << 8) + Math.round(b * 0xff);
    }

    /** '#RRGGBB' -> 0xRRGGBB. */
    static fromHex(color: string): number {
        const value = parseInt((color ?? '').replace('#', ''), 16);
        return Number.isFinite(value) ? value & 0xffffff : 0;
    }
}
