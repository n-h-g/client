import {IRoomMapObject} from './IRoomMapObject';

export interface IRoomMapPlane {
    get mapObjects(): Array<IRoomMapObject>;
}
