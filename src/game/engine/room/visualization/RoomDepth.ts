/**
 * Depth of the sprites as Nitro sorts them (RoomGeometry with the camera at -135°, 30°): smaller = nearer
 * to the viewer. The client sorts the furni and the avatars with their zIndex; this is used only where a
 * furni must be split around the avatars on it (its layers in front of them, see ItemVisualization).
 * No imports: it's used by RoomEntityRepository too.
 */
export class RoomDepth {
    /** Depth per tile along x or y: cos(30°) * cos(45°). */
    static readonly PER_TILE = Math.cos(Math.PI / 6) * Math.SQRT1_2;
    /** Depth per height unit: sin(30°) times the z scale sqrt(1/2) / sqrt(3/4). */
    static readonly PER_HEIGHT = 0.5 * (Math.SQRT1_2 / Math.sqrt(0.75));

    /** Relative depth of the avatar sprites standing/sitting (AvatarVisualization.AVATAR_SPRITE_DEFAULT_DEPTH). */
    static readonly AVATAR = -0.01;
    /** Relative depth of a laying avatar: it goes in the bed (AvatarVisualization.AVATAR_SPRITE_LAYING_DEPTH). */
    static readonly AVATAR_LAYING = -0.409;

    /** Depth of a point of the room. */
    static of(x: number, y: number, z: number): number {
        return -RoomDepth.PER_TILE * (x + y) - RoomDepth.PER_HEIGHT * z;
    }

    /**
     * Depth of a furni layer from the furni origin: the layer z / -1000 (Nitro's SizeData), with the layers
     * of the same z in their order, times FurnitureVisualization.DEPTH_MULTIPLIER.
     */
    static ofLayer(z: number, layerId: number): number {
        return (z / -1000 - layerId * 0.001) * Math.SQRT1_2;
    }
}
