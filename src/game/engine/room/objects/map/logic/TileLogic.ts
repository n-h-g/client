import {MapData} from '../MapData';
import {TileType} from '../TileTypeEnum';
import {Container} from 'pixi.js';
import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {RoomObjectLogic} from '../../../../../core/room/object/RoomObjectLogic';
import {Tile} from '../Tile';
import {OfflineMode} from '../../../../../offline/OfflineMode';
import {RoomPriority} from '../../../visualization/RoomPriority';
import {RoomVisualization} from '../../../visualization/RoomVisualization';
import {PointerLogic} from './PointerLogic';
import { Logger } from '../../../../../utils/Logger';

export class TileLogic extends RoomObjectLogic {
    private tile: Tile;
    private hitContext: CanvasRenderingContext2D | null;

    constructor(tile: Tile) {
        super();

        this.tile = tile;

        const canvas = this.tile.plane.room.logic.getCanvasFloorHit();
        this.hitContext = canvas.getContext('2d');

        this.checkTileAndDrawHitBox();
    }

    registerEvents() {
        // Hover and click are dispatched by RoomLogic, which finds the tile under the mouse
        // from the floor geometry (furni drawn over the tile don't block it).
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    onClick(): void {

        if(Engine.getInstance().config.debugRoomClick) {
            Logger.debug("x: " + this.tile.position.x + " y: " + this.tile.position.y)
        }

        if (Engine.getInstance().config.offlineMode) {
            OfflineMode.getInstance().walk(this.tile.position);
            return;
        }
        if (
            this.tile.plane.room
                .getRoom()
                .roomEntityRepository.isEntityRolling()
        ) {
            this.tile.plane.room
                .getRoom()
                .roomEntityRepository.stopRollingEntity();

            // this click places the furni that was being moved: the avatar doesn't walk
            return;
        }

        Engine.getInstance().networkingManager.packetManager.applyOut(
            OutgoingPacket.UserMove,
            {
                x: this.tile.position.x,
                y: this.tile.position.y,
            }
        );
    }

    onMove(delta: number): void {}

    onHover() {
        const tileContext: Container | null | undefined =
            this.tile.visualization?.container;

        if(!tileContext) return;

        const isDoor =
            this.tile.position.x ==
                this.tile.plane.room.getDoorPosition().x &&
            this.tile.position.y ==
                this.tile.plane.room.getDoorPosition().y;

        this.tile.plane.room.visualization.getCanvasPointer().zIndex =
            RoomVisualization.calculateZIndex(
                this.tile.position,
                isDoor ? RoomPriority.DOOR_FLOOR_SELECT : RoomPriority.POINTER
            );
        (
            this.tile.plane.room.getPointer().logic as PointerLogic
        ).togglePointer();
        this.tile.plane.room
            .getPointer()
            .visualization.updatePosition(
                this.tile
            );

        const repository = this.tile.plane.room.getRoom().roomEntityRepository;

        // the furni goes on the tile (turned if it doesn't fit), or becomes its icon if it can't go there
        if (repository.isEntityRolling()) repository.updateRollingEntity(this.tile.position);
    }

    checkTileAndDrawHitBox() {
        if (this.tile.type != TileType.Hole) {
            if (this.hitContext != null) {
                const ctx = this.drawTileHitBox(this.hitContext);
            }
        }
    }

	tick(delta: number): void {}

    private drawTileHitBox(
        hitCtx: CanvasRenderingContext2D
    ): CanvasRenderingContext2D {
        hitCtx.save();

        hitCtx.beginPath();
        hitCtx.moveTo(
            this.tile.visualization!.offsetX + MapData.tileWidth / 2,
            this.tile.visualization!.offsetY
        );
        hitCtx.lineTo(
            this.tile.visualization!.offsetX + MapData.tileWidth,
            this.tile.visualization!.offsetY + MapData.tileHeight / 2
        );
        hitCtx.lineTo(
            this.tile.visualization!.offsetX + MapData.tileWidth / 2,
            this.tile.visualization!.offsetY + MapData.tileHeight
        );
        hitCtx.lineTo(
            this.tile.visualization!.offsetX,
            this.tile.visualization!.offsetY + MapData.tileHeight / 2
        );
        hitCtx.closePath();
        hitCtx.fillStyle = this.tile.color.toString();
        hitCtx.fill();

        hitCtx.restore();

        return hitCtx;
    }
}
