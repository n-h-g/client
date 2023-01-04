import { FloorPlane } from '../../../../engine/room/objects/map/FloorPlane';
import { RoomPlane } from '../../../../engine/room/objects/map/RoomPlane';
import { WallPlane } from '../../../../engine/room/objects/map/WallPlane';
import ColorRGB from "../../../../utils/color/ColorRGB"

export interface IRoomMapObject {
    get color(): ColorRGB 
    get plane(): FloorPlane | WallPlane | RoomPlane
}
