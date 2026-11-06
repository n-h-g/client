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
import { WallItem } from '../engine/room/objects/items/WallItem';
import { FurnitureWallData, IWallDataParser } from '../engine/room/objects/items/WallItemData';

// ... (mantenere gli import esistenti)

export class OfflineMode {
    private engine: Engine;
    private entity: Entity;
    private static instance: OfflineMode;
    
    // CONFIGURAZIONE FURNI
    private static RANDOM_ITEMS = true; 
    private static ITEMS = ['habbocake', 'snst_tree1'];
    private static NUMBER_OF_ITEMS = 0; // Quanti furni generare

    private static WALL_ITEMS = ['ny2013_wall'];
    private static NUMBER_OF_WALL_ITEMS = 1;
    
    // CONFIGURAZIONE UTENTI
    private static NUMBER_OF_USERS = 1; // Quanti utenti generare (cambia N qui)
    private static FIGURES = [
        'ch-255-82.lg-275-67.ha-1012-1331.hd-190-13',
        'hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61', // Default 
        'hr-100.hd-180-1.ch-210-66.lg-270-82.sh-290-91',                 // Boy
        'hr-515-33.hd-600-1.ch-630-82.lg-695-73.sh-735-68',              // Girl
        'hr-828-45.hd-180-2.ch-210-121.lg-270-82.sh-290-91.he-1601-62'   // Boy with accessory
    ];

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

        // Layout della stanza
        const generatedModel =
            '000000000000000000000/000000000001111111111/000000000001111111111/000000000001111111111/000000000001111111111/000000000001111111111/000000000001111111111/011111111111111111111/011111111111111111111/011111111111111111111/111111111111111111111/011111111111111111111/011111111111111111111/011111111111111111111/011111111111111111111/011111111111111111111/011111111111111111111/011111111110000000000/011111111110000000000/011111111110000000000/011111111110000000000/011111111110000000000/011111111110000000000/000000000000000000000';

        const room = this.engine.roomService.setRoom(
            'prova',
            generatedModel,
            new Point(10, 0),
            200,
            ''
        );

        for (let i = 0; i < OfflineMode.NUMBER_OF_USERS; i++) {
            const randomTile = room.roomLayout.getFloorPlane().getRandomTile() as Tile;
            
            // Scegli una figura a caso dall'array
            const randomFigure = OfflineMode.FIGURES[Math.floor(Math.random() * OfflineMode.FIGURES.length)];
            
            const entity = new UserEntity(
                'user_' + i,
                'Utente_' + i,
                randomFigure
            );
            
            entity.visualization.direction = 6;
            entity.position = new Point3d(randomTile.position.x, randomTile.position.y, 0);
            this.engine.roomService.currentRoom.roomEntityRepository.add(entity.id, entity);
            (entity.visualization as HumanVisualization).addAction(ActionId.SIT);
            entity.visualization.render();

            // Salva il primo utente generato come l'entità principale controllata dal metodo walk()
            if (i === 0) {
                this.entity = entity;
            }
        }

        // --- GENERAZIONE SERIE DI FURNI ---
        for (let i = 0; i < OfflineMode.NUMBER_OF_ITEMS; i++) {

            const randomTile = room.roomLayout.getFloorPlane().getRandomTile() as Tile;

            let spriteName: string;
            if (OfflineMode.RANDOM_ITEMS) {
                spriteName = OfflineMode.ITEMS[Math.floor(Math.random() * OfflineMode.ITEMS.length)];
            } else {

                spriteName = OfflineMode.ITEMS[i % OfflineMode.ITEMS.length];
            }

            try {
                // 3. Carica la definizione (base) del furni
                const base = await this.engine.userInterfaceManager!.furniImager.loadFurniBase(
                    FurnidataItemType.FloorItem,
                    spriteName
                );

                // 4. Crea l'oggetto FloorItem con un ID univoco
                const item = new FloorItem(
                    `furni_offline_${i}_${Math.random()}`, // ID Univoco fondamentale
                    spriteName,
                    new Point3d(
                        randomTile.position.x,
                        randomTile.position.y,
                        randomTile.position.z
                    ),
                    base
                );


                item.visualization.direction = Direction.EAST;
                item.visualization.needsUpdate = true
                item.visualization?.render();
                

                this.engine.roomService.currentRoom.roomEntityRepository.add(
                    item.id,
                    item
                );
            } catch (e) {
                console.error(`Errore nel caricamento del furni: ${spriteName}`, e);
            }
        }

        for (let i = 0; i < OfflineMode.NUMBER_OF_WALL_ITEMS; i++) {
            const spriteName = OfflineMode.WALL_ITEMS[i % OfflineMode.WALL_ITEMS.length];

            const side = 'r'
            const wallX = 7;
            const wallY = 5;
            const localX = 0;
            const localY = 0;
            
            const wallLocationString = `:w=${wallX},${wallY} l=${localX},${localY} ${side}`;

            try {
                const base = await this.engine.userInterfaceManager!.furniImager.loadFurniBase(
                    FurnidataItemType.WallItem,
                    spriteName
                );

                const mockWallData: IWallDataParser = {
                    width: 0,
                    height: 0,
                    localX: localX,
                    localY: localY,
                    direction: 2,
                    stuffData: "0",
                    secondsToExpiration: -1,
                    y: 0,
                    z: 0,
                    isOldFormat: false
                };

                const wallData = new FurnitureWallData(mockWallData);

                const item = new WallItem(
                    `wall_offline_${i}`,
                    spriteName,
                    base,
                    wallData
                );

                item.visualization.direction = (side === 'r') ? 4 : 2;
                item.visualization.needsUpdate = true;
                await item.visualization.render();

                this.engine.roomService.currentRoom.roomEntityRepository.add(
                    item.id,
                    item
                );
            } catch (e) {
                console.error(`Errore caricamento WallItem: ${spriteName}`, e);
            }
        }
        // ----------------------------------
    }

    walk(point: Point3d) {
        if (!this.entity) return;

        // Se la destinazione è uguale alla posizione attuale, ferma l'omino
        if (point.x === this.entity.position.x && point.y === this.entity.position.y) {
            (this.entity.visualization as HumanVisualization).removeAction(ActionId.WALK);
            (this.entity.visualization as HumanVisualization).addAction(ActionId.STAND);
            this.entity.visualization.needsUpdate = false;
            return;
        }

        this.entity.visualization.setNextPosition(point);
        this.entity.visualization.direction = Rotation.calculateDirection(
            new Point(this.entity.position.x, this.entity.position.y),
            new Point(point.x, point.y)
        );

        (this.entity.visualization as HumanVisualization).addAction(ActionId.WALK);
        this.entity.visualization.needsUpdate = true;
    }
}