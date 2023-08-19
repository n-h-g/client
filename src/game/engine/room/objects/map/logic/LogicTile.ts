import MapData from '../MapData'
import { TileType } from '../TileTypeEnum'
import { Container, Texture } from 'pixi.js'
import { Engine } from '../../../../../Engine'
import { OutgoingPacket } from '../../../../../networking/packets/outgoing/OutgoingPacket'
import { RoomObjectLogic } from '../../../../../core/room/object/RoomObjectLogic'
import { Tile } from '../Tile'
import { OfflineMode } from '../../../../../offline/OfflineMode'
import { RoomPriority } from '../../../visualization/RoomPriority'
import RoomVisualization from '../../../visualization/RoomVisualization'

export default class LogicTile extends RoomObjectLogic {
    private tile: Tile

    private hitContext: CanvasRenderingContext2D | null

    constructor(tile: Tile) {
        super()

        this.tile = tile

        let canvas = this.tile.plane.room.Logic.getCanvasFloorHit()
        this.hitContext = canvas.getContext('2d')

        this.checkTileAndDrawHitBox()
    }

    public registerEvents() {
        setTimeout(() => {
            this.tile.visualization?.container?.on('pointerdown', () => this.onClick());
            this.tile.visualization?.container?.on('pointerover', () => this.onHover())
        }, 200);
    }

    dispose(): void {
        throw new Error('Method not implemented.')
    }

    public onClick(): void {
        if (Engine.getInstance().config.offlineMode) {
            OfflineMode.getInstance().walk(this.tile.position)
            return
        }

        if(this.tile.plane.room.getRoom().roomEntityRepository.isEntityRolling()) {
            this.tile.plane.room.getRoom().roomEntityRepository.stopRollingEntity()
        }

        Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserMove, {
            x: this.tile.position.getX(),
            y: this.tile.position.getY()
        })
    }

    public onMove(delta: number): void {

    }

    public onHover() {
        let tileContext: Container | null | undefined = this.tile.visualization?.container;

        let isDoor = this.tile.position.getX() == this.tile.plane.room.getDoorPosition().getX() && this.tile.position.getY() == this.tile.plane.room.getDoorPosition().getY()

        this.tile.plane.room.Visualization.getCanvasPointer().zIndex = RoomVisualization.calculateZIndex(this.tile.position, isDoor ? RoomPriority.DOOR_FLOOR_SELECT : RoomPriority.POINTER);
        this.tile.plane.room.Visualization.getCanvasPointer().visible = true;
        this.tile.plane.room.getPointer().visualization.updatePosition(tileContext!.x, tileContext!.y, this.tile);
        this.tile.plane.room.getRoom().roomEntityRepository.updateRollingEntity(this.tile.position);
    }

    public checkTileAndDrawHitBox() {
        if (this.tile.type != TileType.Hole) {
            if (this.hitContext != null) {
                let ctx = this.drawTileHitBox(this.hitContext)
            }
        }
    }

    private drawTileHitBox(hitCtx: CanvasRenderingContext2D): CanvasRenderingContext2D {
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
        hitCtx.lineTo(this.tile.visualization!.offsetX + MapData.tileWidth / 2, this.tile.visualization!.offsetY + MapData.tileHeight);
        hitCtx.lineTo(this.tile.visualization!.offsetX, this.tile.visualization!.offsetY + MapData.tileHeight / 2);
        hitCtx.closePath();
        hitCtx.fillStyle = this.tile.color.toString();
        hitCtx.fill();

        hitCtx.restore();

        return hitCtx;
    }

    tick(delta: number): void {

    }
}