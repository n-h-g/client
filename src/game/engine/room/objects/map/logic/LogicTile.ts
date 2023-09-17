import {MapData} from '../MapData';
import {TileType} from '../TileTypeEnum';
import {Container, Texture} from 'pixi.js';
import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {RoomObjectLogic} from '../../../../../core/room/object/RoomObjectLogic';
import {Tile} from '../Tile';
import {OfflineMode} from '../../../../../offline/OfflineMode';
import {RoomPriority} from '../../../visualization/RoomPriority';
import {RoomVisualization} from '../../../visualization/RoomVisualization';
import {LogicPointer} from './LogicPointer';

export class LogicTile extends RoomObjectLogic {
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
        setTimeout(() => {
            this.tile.visualization?.container?.on('pointerdown', () =>
                this.onClick()
            );
            this.tile.visualization?.container?.on('pointerover', () =>
                this.onHover()
            );
        }, 200);
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    onClick(): void {
        if (Engine.getInstance().config.offlineMode) {
            OfflineMode.getInstance().walk(this.tile.position);
            return;
        }

        if (
            this.tile.plane.room
                .getRoom()
                .roomEntityRepository.isEntityRolling()
        )
            this.tile.plane.room
                .getRoom()
                .roomEntityRepository.stopRollingEntity();

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
            this.tile.plane.room.getPointer().logic as LogicPointer
        ).togglePointer();
        this.tile.plane.room
            .getPointer()
            .visualization.updatePosition(
                tileContext!.x,
                tileContext!.y,
                this.tile
            );
        this.tile.plane.room
            .getRoom()
            .roomEntityRepository.updateRollingEntity(this.tile.position);
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
