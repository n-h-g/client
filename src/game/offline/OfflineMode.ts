import {Direction} from '../core/objects/Direction';
import {Entity} from '../core/room/object/entities/Entity';
import {HumanVisualization} from '../core/room/object/human/visualization/HumanVisualization';
import {Engine} from '../Engine';
import {FloorItem} from '../engine/room/objects/items/FloorItem';
import {UserEntity} from '../engine/room/objects/users/UserEntity';
import {ActionId} from '../engine/ui/imagers/avatars/enum/actions/ActionId';
import {FurnidataItemType} from '../engine/ui/imagers/items/enum/FurniDataItemType';
import {Point} from '../utils/point/Point';
import {Point3d} from '../utils/point/Point3d';
import {Rotation} from '../utils/Rotation';
import {Tile} from '../engine/room/objects/map/Tile';

export class OfflineMode {
    private engine: Engine;
    private entity: Entity;
    private static instance: OfflineMode;
    private static ENTITY_ID = '473674-34dfbnasb-43423';
    private static RANDOM_ITEMS = false;
    private static ITEM = 'habbocake';
    private static NUMBER_OF_ITEMS = 1;
    private static NUMBER_OF_USERS = 1;
    private static ROOM_SIZE = 20;

    constructor(engine: Engine) {
        this.engine = engine;
    }

    static getInstance(): OfflineMode {
        return this.instance;
    }

    async init() {
        if (!OfflineMode.instance) {
            OfflineMode.instance = this;
        }

        const generatedModel =
            '00000000000000000000000000000000000000000000/00000000000000000000000000000000000000000000/00000000000000000000000000000010000000000000/00000000000000000000000000000011000000000000/00000000000001011000000000001011100000000000/00000000000011111111111111111111110000000000/00000000000111111111111111111111111000000000/00000000000111111111111111111111111100000000/00000000000111111111111111111111111110000000/00000000111111111111111111111111111111000000/00000001111111111111111111111111111111100000/00000001111111111111111111111111111111110000/00000001111111111111111111111111111111111000/00000000011111111111111111111111111111111100/11111111111111111111001111111111111111111100/11111111111111111110000111111111110000000100/11111111111111111110000111111111110111110000/00000110111111111100000100000011110111111100/00000111111111111100000100111011110111111000/00000111111111111100000101111111110111110000/00000111111011111110000101111111110001100000/00000000111011111110001100011111101111000000/00000000111011111100001011111111111110000000/00000000111011111111111111111111111100000000/00000000111011111111111111111111111000000000/00000000011011111111110111111110110000000000/00000000001011111110001111111000000000000000/00000000000011111100001111111000000000000000/00000000000011111100011000001100000000000000/00000000000000000100010011101100000000000000/00000000000000000100010111111000000000000000/00000000000000000100010111110000000000000000/00000000000000000100000110000000000000000000/00000000000000000100000100000000000000000000';

        const room = this.engine.roomService.setRoom(
            'prova',
            generatedModel,
            new Point(0, 0),
            200,
            ''
        );

        for (let i = 0; i < OfflineMode.NUMBER_OF_USERS; i++) {
            const randomTile = room.roomLayout
                .getFloorPlane()
                .getRandomTile() as Tile;

            this.entity = new UserEntity(
                'id',
                'prova',
                'hd-615-18.ch-822-79.lg-710-81.sh-905-108.ha-1002-96.wa-2001-'
            );
            this.entity.visualization.direction = Direction.WEST;
            this.entity.position =
                OfflineMode.NUMBER_OF_USERS == 1
                    ? new Point3d(
                          room.roomLayout.getDoorPosition().x,
                          room.roomLayout.getDoorPosition().y,
                          0
                      )
                    : randomTile.position;
            this.engine.roomService.currentRoom.roomEntityRepository.add(
                this.entity.id,
                this.entity
            );
            this.entity.visualization.render();
        }

        for (let i = 0; i < OfflineMode.NUMBER_OF_ITEMS; i++) {
            const randomTile = room.roomLayout
                .getFloorPlane()
                .getRandomTile() as Tile;

            const randomItem =
                this.engine.userInterfaceManager.furniImager.generateRandomItem();

            const base =
                await this.engine.userInterfaceManager!.furniImager.loadFurniBase(
                    FurnidataItemType.FloorItem,
                    OfflineMode.RANDOM_ITEMS ? randomItem : OfflineMode.ITEM
                );
            const item = new FloorItem(
                OfflineMode.ENTITY_ID,
                OfflineMode.ITEM,
                new Point3d(
                    randomTile.position.x,
                    randomTile.position.y,
                    1
                ),
                base
            );
            item.visualization?.render();
            this.engine.roomService.currentRoom.roomEntityRepository.add(
                item.id,
                item
            );
        }
    }

    walk(point: Point3d) {
        if (point == this.entity.position) {
            (this.entity.visualization as HumanVisualization).removeAction(
                ActionId.WALK
            );
            (this.entity.visualization as HumanVisualization).addAction(
                ActionId.STAND
            );
            this.entity.visualization.needsUpdate = false;
            return;
        }

        this.entity.visualization.setNextPosition(point);

        this.entity.visualization.direction = Rotation.calculateDirection(
            new Point(
                this.entity.position.x,
                this.entity.position.y
            ),
            new Point(point.x, point.y)
        );

        (this.entity.visualization as HumanVisualization).addAction(
            ActionId.WALK
        );

        this.entity.visualization.needsUpdate = true;
    }
}
