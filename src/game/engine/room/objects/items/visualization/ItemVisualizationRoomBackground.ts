import {Engine} from '../../../../../Engine';
import {Point3d} from '../../../../../utils/point/Point3d';
import {RoomPriority} from '../../../visualization/RoomPriority';
import {RoomVisualization} from '../../../visualization/RoomVisualization';
import {BrandedImage} from '../../../../ui/imagers/items/Furni';
import {Item} from '../Item';
import {ItemVisualizationBranded} from './ItemVisualizationBranded';

/**
 * A room background (visualizationType furniture_bg: ads_background), as Nitro's FurnitureRoomBackgroundVisualization:
 * the image goes from the furni origin towards its direction.
 *
 * Its depth, as Nitro: the layer has z -10000000, a depth of 10000 tiles behind the furni (SizeData: z / -1000), and
 * offsetZ brings it forward (getLayerZOffset - offsetZ). So with offsetZ under 10000 it's behind the whole room (walls
 * and floor too), at 10000 it's where the furni is, over 10000 it goes in front of the furni, avatars and walls
 * nearer to the viewer, by as many tiles: e.g. 10100 is over the whole room.
 * Here the walls are all at the same depth, under every furni and avatar (RoomPriority): the background is over the
 * walls and the floor, under all the furni, when x + y of the furni + offsetZ - 10000 is between -37 and the lowest
 * x + y of the other furni - 1 (e.g. at x + y = 42, with furni from x + y = 2: offsetZ from 9921 to 9959).
 *
 * As Nitro's isFurnitureSelectionDisabled it can't be selected with a click, but by a moderator: here the owner of the
 * room (it edits it in the infostand), only while it's behind the room (over the floor it would catch the clicks to
 * walk).
 * The furni chooser (:furni) selects it anyway.
 */
export class ItemVisualizationRoomBackground extends ItemVisualizationBranded {
    /** The depth of its layer in Nitro, in tiles behind the furni: offsetZ subtracts from it. */
    private static readonly LAYER_DEPTH = 10000;

    constructor(item: Item) {
        super(item);
    }

    protected imagePlacement(): Pick<BrandedImage, 'anchor' | 'offsetZ'> {
        // offsetZ moves the whole furni (getZIndex), not the layer among its layers
        return {anchor: 'direction', offsetZ: 0};
    }

    updatePosition(): void {
        super.updatePosition();

        // super.updatePosition leaves it 'none' while it's moved (the click that places it)
        if (this.container && this.container.eventMode !== 'none' && !this.selectable()) this.container.eventMode = 'none';
    }

    /** Only the owner of the room selects it with a click, while it's behind the room (see the class). */
    private selectable(): boolean {
        // behind the planes of the room: their zIndex is positive (RoomVisualization.calculateZIndex)
        return this.getZIndex() < 0 && !!Engine.getInstance()?.roomService?.ownsCurrentRoom();
    }

    /** How many tiles it's nearer to the viewer than the furni: negative behind (see the class). */
    private depthShift(): number {
        return (this.branding?.offsetZ ?? 0) - ItemVisualizationRoomBackground.LAYER_DEPTH;
    }

    /**
     * The zIndex of the furni moved by the depth shift along the depth of the room (x + y), as a furni: far behind
     * the planes of the room (their zIndex is positive) with the usual offsetZ, among the furni and over the walls
     * from 10000 (every furni and avatar is over the walls, see RoomPriority).
     */
    getZIndex(): number {
        const position = this.entity.position;

        return RoomVisualization.calculateZIndex(
            new Point3d(position.x, position.y + this.depthShift(), position.z),
            RoomPriority.ROOM_ITEM
        );
    }
}
