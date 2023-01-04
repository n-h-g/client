import MapData from "../MapData"
import TileType from "../TileTypeEnum"
import Room from "../../../Room"
import { Container } from 'pixi.js'
import { Engine } from "../../../../../Engine"
import { OutgoingPacket } from "../../../../../networking/packets/outgoing/OutgoingPacket"
import { RoomObjectLogic } from '../../../../../core/room/object/RoomObjectLogic'
import { Tile } from '../Tile'

export default class LogicTile extends RoomObjectLogic {
    private tile: Tile
    private hitContext: CanvasRenderingContext2D | null

    constructor(tile: Tile) {
        super()

        this.tile = tile

        let canvas = this.tile.plane.room.Logic.getCanvasFloorHit()
        this.hitContext = canvas.getContext("2d")

        this.checkTileAndDrawHitBox()
    }

    public registerEvents() {
        setTimeout(() => {
            this.tile.visualization?.container?.on('pointerdown', () => this.onClick());
            this.tile.visualization?.container?.on('pointerover', () => this.onHover())
        }, 200);
    }

    public onClick(): void {
        Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserMove, {
            x: this.tile.position.getX(),
            y: this.tile.position.getY()
        })
    }

    public onMove(delta: number): void {

    }

    public onHover() {
        let room: Room | null = this.tile.plane.room.getRoom();

        let tileContext: Container | null | undefined = this.tile.visualization?.container;

        this.tile.plane.room.Visualization.getCanvasPointer().zIndex = 5;
        this.tile.plane.room.Visualization.getCanvasPointer().visible = true;
        this.tile.plane.room.getPointer().visualization.updatePosition(tileContext!.x, tileContext!.y, this.tile);
    }

    public checkTileAndDrawHitBox() {
        if (this.tile.type != TileType.Hole) {
            if (this.hitContext != null) {
                this.drawTileHitBox(this.hitContext)
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