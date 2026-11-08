import {BLEND_MODES, ColorMatrixFilter, Container, Graphics} from 'pixi.js';
import {ColorConverter} from '../../../utils/color/ColorConverter';

/**
 * The light of a room (the room dimmer), as Nitro:
 * - the background only (the floor and the walls): their colors are multiplied by the light color, that changes
 *   in 1.5 s (RoomLogic.updateBackgroundColor and RoomVisualization: the planes tinted with ROOM_BACKGROUND_COLOR);
 * - the whole room (the furni and the avatars too): the colors of the room are multiplied by the light color at
 *   once (nitro-react RoomColorView, the NitroAdjustmentFilter of the room display on RoomBackgroundColorEvent).
 *   Here a rectangle over the room with the MULTIPLY blend does the same multiplication: a filter on the whole
 *   room was cut to a part of it and rendered the room again at every frame.
 * The light color is the color of the dimmer with the brightness as HSL lightness: at the full brightness it's
 * white (the room as usual), lower it's darker and colored.
 */
export class RoomLight {
    /** Nitro's RoomLogic transition of the background color. */
    static readonly TRANSITION_MS = 1500;

    static readonly WHITE = 0xffffff;

    private color = RoomLight.WHITE;
    private light = 0xff;
    private originalColor = RoomLight.WHITE;
    private originalLight = 0xff;
    private targetColor = RoomLight.WHITE;
    private targetLight = 0xff;
    private changedAt = 0;
    private backgroundOnly = false;

    private readonly planesFilter = new ColorMatrixFilter();
    /** Over everything in the room: it multiplies the colors under it by its tint. */
    private readonly roomOverlay: Graphics;
    private animation: number | null = null;

    /**
     * @param room the container of the whole room.
     * @param planes the containers of the floor and of the walls.
     */
    constructor(private readonly room: Container, private readonly planes: Container[]) {
        const overlay = new Graphics();
        overlay.beginFill(0xffffff).drawRect(-RoomLight.OVERLAY_SIZE / 2, -RoomLight.OVERLAY_SIZE / 2, RoomLight.OVERLAY_SIZE, RoomLight.OVERLAY_SIZE).endFill();
        overlay.blendMode = BLEND_MODES.MULTIPLY;
        overlay.eventMode = 'none';
        overlay.zIndex = Number.MAX_SAFE_INTEGER;
        overlay.visible = false;
        // not part of the size of the room (e.g. the images of the room made from its bounds)
        (overlay as any)._calculateBounds = () => {};

        room.addChild(overlay);
        this.roomOverlay = overlay;
    }

    /** The overlay covers the room whatever its size and its position on the screen. */
    private static readonly OVERLAY_SIZE = 100000;

    /**
     * As Nitro's RoomEngine.updateObjectRoomColor.
     *
     * @param color the color of the dimmer (0xRRGGBB), white to switch the light off.
     * @param light the brightness (0-255).
     * @param backgroundOnly true to color only the floor and the walls.
     */
    setColor(color: number, light: number, backgroundOnly: boolean): void {
        this.originalColor = this.color;
        this.originalLight = this.light;
        this.targetColor = color;
        this.targetLight = light;
        this.changedAt = performance.now();
        this.backgroundOnly = backgroundOnly;

        // the whole room changes at once (nitro-react)
        const roomColor = backgroundOnly ? RoomLight.WHITE : RoomLight.lightColor(color, light);
        if (!this.roomOverlay.destroyed) {
            this.roomOverlay.tint = roomColor;
            this.roomOverlay.visible = roomColor !== RoomLight.WHITE;
        }

        this.update();
    }

    dispose(): void {
        if (this.animation !== null) cancelAnimationFrame(this.animation);
        this.animation = null;
    }

    /** The background color goes to the target in TRANSITION_MS (Nitro's RoomLogic.updateBackgroundColor). */
    private update = (): void => {
        this.animation = null;

        const t = Math.min(1, (performance.now() - this.changedAt) / RoomLight.TRANSITION_MS);

        if (t >= 1) {
            this.color = this.targetColor;
            this.light = this.targetLight;
        } else {
            const mix = (shift: number) => {
                const from = (this.originalColor >> shift) & 0xff;
                const to = (this.targetColor >> shift) & 0xff;
                return Math.round(from + (to - from) * t);
            };

            this.color = (mix(16) << 16) + (mix(8) << 8) + mix(0);
            this.light = this.originalLight + (this.targetLight - this.originalLight) * t;
        }

        const background = this.backgroundOnly ? RoomLight.lightColor(this.color, this.light) : RoomLight.WHITE;
        for (const plane of this.planes) this.applyFilter(plane, this.planesFilter, background);

        if (t < 1) this.animation = requestAnimationFrame(this.update);
    };

    /** The color with the brightness as lightness (Nitro: hslToRGB((rgbToHSL(color) & 0xFFFF00) + light)). */
    static lightColor(color: number, light: number): number {
        return ColorConverter.hslToRGB((ColorConverter.rgbToHSL(color) & 0xffff00) + Math.round(Math.max(0, Math.min(0xff, light))));
    }

    /** The filter multiplies red, green and blue by the color; with white it's removed (nothing to do). */
    private applyFilter(container: Container, filter: ColorMatrixFilter, color: number): void {
        if (container.destroyed) return;

        const others = (container.filters ?? []).filter(f => f !== filter);

        if (color === RoomLight.WHITE) {
            container.filters = others.length ? others : null;
            return;
        }

        const r = ((color >> 16) & 0xff) / 0xff;
        const g = ((color >> 8) & 0xff) / 0xff;
        const b = (color & 0xff) / 0xff;

        filter.matrix = [r, 0, 0, 0, 0, 0, g, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];
        // as sharp as the rest of the room on the high density screens
        filter.resolution = window.devicePixelRatio || 1;

        container.filters = [...others, filter];
    }
}
