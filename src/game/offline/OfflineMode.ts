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

    private static ENTITY_ID: string = "473674-34dfbnasb-43423"

    private static RANDOM_ITEMS: boolean = false

    private static ITEM: string = "dasdsad"

    private static NUMBER_OF_ITEMS = 1

    private static NUMBER_OF_USERS = 1

    private static ROOM_SIZE = 10

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

        let generatedModel = this._engine.roomService.generateSquareRoomModel(OfflineMode.ROOM_SIZE)


        let room = this._engine.roomService.setRoom("prova", generatedModel, new Point(0, 0), 200)

        for(let i = 0; i < OfflineMode.NUMBER_OF_USERS; i++) {
            const randomTile = room.roomLayout.getFloorPlane().getRandomTile() as Tile


            this._entity = new UserEntity("id", "prova", "hd-615-18.ch-822-79.lg-710-81.sh-905-108.ha-1002-96.wa-2001-")
            this._entity.visualization.Rot = Direction.WEST;
            this._entity.position = OfflineMode.NUMBER_OF_USERS == 1 ? new Point3d(room.roomLayout.getDoorPosition().getX(), room.roomLayout.getDoorPosition().getY(), 0) : randomTile.position
            this._engine.roomService.CurrentRoom.roomEntityRepository.add(this._entity.id, this._entity);
            this._entity.visualization.render()
        }


       
        for(let i = 0; i < OfflineMode.NUMBER_OF_ITEMS; i++) {
            const randomTile = room.roomLayout.getFloorPlane().getRandomTile() as Tile

            const randomItem = this._engine.userInterfaceManager.furniImager.generateRandomItem()

            let base = await this._engine.userInterfaceManager!.furniImager.loadFurniBase(FurnidataItemType.FloorItem, OfflineMode.RANDOM_ITEMS ? randomItem : OfflineMode.ITEM);
            let item = new FloorItem(OfflineMode.ENTITY_ID, OfflineMode.ITEM, new Point3d(randomTile.position.getX(), randomTile.position.getY(), 1), base);
            item.visualization?.render()
            this._engine.roomService.CurrentRoom.roomEntityRepository.add(item.id, item)
        }
          
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