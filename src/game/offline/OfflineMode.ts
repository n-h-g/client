import { Direction } from "../core/objects/Direction";
import { Entity } from "../core/room/object/entities/Entity";
import { HumanVisualization } from "../core/room/object/human/visualization/HumanVisualization";
import { Engine } from "../Engine";
import FloorItem from "../engine/room/objects/items/FloorItem";
import { UserEntity } from "../engine/room/objects/users/UserEntity";
import RoomVisualization from "../engine/room/visualization/RoomVisualization";
import { ActionId } from "../engine/ui/imagers/avatars/enum/actions/ActionId";
import { ItemType } from "../engine/ui/imagers/items/FurniImager";
import Point from "../utils/point/Point";
import Point3d from "../utils/point/Point3d";
import Rotation from "../utils/Rotation";

export class  OfflineMode {

    private _engine: Engine

    private static _instance: OfflineMode

    private _entity: Entity

    private static entityId: string = "473674-34dfbnasb-43423"

    private static item: string = "hole"

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

        this._entity = new UserEntity("id", "prova", "hd-185-10.hr-3163-61.ch-3030-92.lg-275-110")
        this._entity.visualization.Rot = Direction.WEST;
        this._engine.roomService.CurrentRoom.roomEntityRepository.add(this._entity.id, this._entity)
                //(entity.visualization as UserEntityVisualization).addAction(ActionId.USE_ITEM)
        this._entity.visualization.render()

        let base = await this._engine.userInterfaceManager!.furniImager.loadFurniBase(ItemType.FloorItem, OfflineMode.item);
        let roomV = this._engine.roomService.CurrentRoom.roomLayout.Visualization as RoomVisualization;
        let item = new FloorItem(OfflineMode.entityId, OfflineMode.item, new Point3d(3, 4, 1), base);
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