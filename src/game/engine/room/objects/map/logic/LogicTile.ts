import Tile from "../Tile"
import RoomLogic from "../../../logic/RoomLogic"
import RoomObjectLogic from "../../../../../core/room/object/RoomObjectLogic"
import MapData from "../MapData"
import TileType from "../TileTypeEnum"
import VisualizationPointer from "../visualization/VisualizationPointer"
import Room from "../../../Room"
import RoomVisualization from "../../../visualization/RoomVisualization"
import { Container } from 'pixi.js'
import { Engine } from "../../../../../Engine"
import { Logger } from "../../../../../utils/Logger"
import { OutgoingPacket } from "../../../../../networking/packets/outgoing/OutgoingPacket"

export default class LogicTile extends RoomObjectLogic {

    private tile: Tile
    private hitContext: CanvasRenderingContext2D | null

    constructor(tile: Tile) {
        super()

        this.tile = tile

        let canvas = (this.tile.getPlane().getRoom().Logic as RoomLogic).getCanvasFloorHit()
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
        let room: Room | null = this.tile.getPlane().getRoom().getRoom();

        if (Engine.getInstance().config.debug) {
            Logger.debug('Clicked: ' + this.tile.position.getX() + ' | ' + this.tile.position.getY())
        }

        Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.UserMove, {
            x: this.tile.position.getX(),
            y: this.tile.position.getY()
        })

    }

    public onMove(delta: number): void {

    }

    public onHover() {
        let room: Room | null = this.tile.getPlane().getRoom().getRoom();

        let tileContext: Container | null | undefined = this.tile.visualization?.container;

        (this.tile.getPlane().getRoom().Visualization as RoomVisualization).getCanvasPointer().zIndex = 5;
        (this.tile.getPlane().getRoom().Visualization as RoomVisualization).getCanvasPointer().visible = true;
        (this.tile.getPlane().getRoom().getPointer().visualization as VisualizationPointer).updatePosition(tileContext!.x, tileContext!.y, this.tile);


    }

    public checkTileAndDrawHitBox() {
        if (this.tile.getType() != TileType.Hole) {
            if (this.hitContext != null) {
                this.drawTileHitBox(this.hitContext)
            }
        }
    }

    private drawTileHitBox(hitCtx: CanvasRenderingContext2D): CanvasRenderingContext2D {

        hitCtx.save();

        hitCtx.beginPath();
        hitCtx.moveTo(
            this.tile.visualization!.getOffsetX() + MapData.tileWidth / 2,
            this.tile.visualization!.getOffsetY()
        );
        hitCtx.lineTo(
            this.tile.visualization!.getOffsetX() + MapData.tileWidth,
            this.tile.visualization!.getOffsetY() + MapData.tileHeight / 2
        );
        hitCtx.lineTo(this.tile.visualization!.getOffsetX() + MapData.tileWidth / 2, this.tile.visualization!.getOffsetY() + MapData.tileHeight);
        hitCtx.lineTo(this.tile.visualization!.getOffsetX(), this.tile.visualization!.getOffsetY() + MapData.tileHeight / 2);
        hitCtx.closePath();
        hitCtx.fillStyle = this.tile.getColor().toString();
        hitCtx.fill();

        hitCtx.restore();

        return hitCtx;
    }

    tick(delta: number): void { }

}