export class ColorRGB {
    private wrappedRed: number;
    private wrappedGreen: number;
    private wrappedBlue: number;

    constructor(r: number, g: number, b: number) {
        this.wrappedRed = r % 256;
        this.wrappedGreen = g % 256;
        this.wrappedBlue = b % 256;
    }

    equals(color: ColorRGB): boolean {
        return (
            this.wrappedRed == color.red &&
            this.wrappedGreen == color.green &&
            this.wrappedBlue == color.blue
        );
    }

    brightness(percentage: number): ColorRGB {
        percentage =
            percentage < -100 ? -100 : percentage > 100 ? 100 : percentage;
        const brightness = (255 * percentage) / 100;
        const red =
            this.wrappedRed + brightness < 0
                ? 0
                : this.wrappedRed + brightness > 255
                ? 255
                : this.wrappedRed + brightness;

        const green =
            this.wrappedGreen + brightness < 0
                ? 0
                : this.wrappedGreen + brightness > 255
                ? 255
                : this.wrappedGreen + brightness;

        const blue =
            this.wrappedBlue + brightness < 0
                ? 0
                : this.wrappedBlue + brightness > 255
                ? 255
                : this.wrappedBlue + brightness;

        return new ColorRGB(red, green, blue);
    }

    get red(): number {
        return this.wrappedRed;
    }

    get green(): number {
        return this.wrappedGreen;
    }

    get blue(): number {
        return this.wrappedBlue;
    }

    toHexString(): string {
        return (
            '#' +
            ((1 << 24) + (this.wrappedRed << 16) + (this.wrappedGreen << 8) + this.wrappedBlue)
                .toString(16)
                .slice(1)
        );
    }

    toHex(): string {
        return this.toHexString().split('.')[0];
    }

    static getRandomColor(): ColorRGB {
        const r = Math.round(Math.random() * 256);
        const g = Math.round(Math.random() * 256);
        const b = Math.round(Math.random() * 256);

        return new ColorRGB(r, g, b);
    }

    static getColorFromHex(hex: string): ColorRGB {
        if (hex.length == 4)
            return new ColorRGB(
                parseInt('0x' + hex[1] + hex[1], 16),
                parseInt('0x' + hex[2] + hex[2], 16),
                parseInt('0x' + hex[3] + hex[3], 16)
            );
        else if (hex.length == 7)
            return new ColorRGB(
                parseInt('0x' + hex[1] + hex[2], 16),
                parseInt('0x' + hex[3] + hex[4], 16),
                parseInt('0x' + hex[5] + hex[6], 16)
            );

        return new ColorRGB(0, 0, 0);
    }

    static getColorFromNumber(num: number): ColorRGB {
        return new ColorRGB((num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff);
    }
}
