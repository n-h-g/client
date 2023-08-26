import { random } from "animejs";
import { Direction } from "../core/objects/Direction";
import { Entity } from "../core/room/object/entities/Entity";
import { HumanVisualization } from "../core/room/object/human/visualization/HumanVisualization";
import { Engine } from "../Engine";
import FloorItem from "../engine/room/objects/items/FloorItem";
import { UserEntity } from "../engine/room/objects/users/UserEntity";
import UserEntityVisualization from "../engine/room/objects/users/visualization/UserEntityVisualization";
import RoomVisualization from "../engine/room/visualization/RoomVisualization";
import { ActionId } from "../engine/ui/imagers/avatars/enum/actions/ActionId";
import { FurnidataItemType } from "../engine/ui/imagers/items/enum/FurniDataItemType";
import Point from "../utils/point/Point";
import Point3d from "../utils/point/Point3d";
import Rotation from "../utils/Rotation";
import { Tile } from "../engine/room/objects/map/Tile";

export class  OfflineMode {

    private _engine: Engine

    private static _instance: OfflineMode

    private _entity: Entity

    private static entityId: string = "473674-34dfbnasb-43423"

    private static item: string = "wed_icesculp"

    public constructor(engine: Engine) {
        this._engine = engine
    }

    public static getInstance(): OfflineMode {
        return this._instance
    }
    
    public async init() {
        if (!OfflineMode._instance) {
            OfflineMode._instance = this
        }

        let room = this._engine.roomService.setRoom("prova", "0000000000/0111001101/01111111011111/0111111111001/0111111", new Point(3, 3), 200)

        this._entity = new UserEntity("id", "prova", "hd-615-18.ch-822-79.lg-710-81.sh-905-108.ha-1002-96.wa-2001-")
        this._entity.visualization.Rot = Direction.WEST;
        this._engine.roomService.CurrentRoom.roomEntityRepository.add(this._entity.id, this._entity);
        //(this._entity.visualization as UserEntityVisualization).addAction(ActionId.LAUGH)
        this._entity.visualization.render()


        let randomTile = room.roomLayout.getFloorPlane().getRandomTiles(5) as Tile


        console.log(randomTile)

        let base = await this._engine.userInterfaceManager!.furniImager.loadFurniBase(FurnidataItemType.FloorItem, OfflineMode.item);
        let item = new FloorItem(OfflineMode.entityId, OfflineMode.item, new Point3d(randomTile.position.getX(), randomTile.position.getY(), 1), base);


        item.visualization?.render()
        this._engine.roomService.CurrentRoom.roomEntityRepository.add(item.id, item)
    }

    public walk(point: Point3d) {

        if(point == this._entity.position) {
            (this._entity.visualization as HumanVisualization).removeAction(ActionId.WALK);
            (this._entity.visualization as HumanVisualization).addAction(ActionId.STAND)
            this._entity.visualization.needsUpdate = false
            return;
        }

        this._entity.visualization.setNextPosition(point);

        this._entity.visualization.Rot = Rotation.calculateDirection(new Point(this._entity.position.getX(), this._entity.position.getY()), new Point(point.getX(), point.getY()));

        (this._entity.visualization as HumanVisualization).addAction(ActionId.WALK)

        this._entity.visualization.needsUpdate = true
    }

}