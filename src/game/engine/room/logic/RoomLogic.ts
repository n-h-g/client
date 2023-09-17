import {RoomLayout} from '../RoomLayout';
import {Engine} from '../../../Engine';
import {Sprite, Texture} from 'pixi.js';
import {Viewport} from 'pixi-viewport';
import {RoomPriority} from '../visualization/RoomPriority';
import {RoomVisualization} from '../visualization/RoomVisualization';
import {Point3d} from '../../../utils/point/Point3d';
import {RenderingUtils} from '../../../utils/RenderingUtils';
import {EventManager} from '../../../core/events/EventManager';
import {UIEvents} from '../../events/ui/UIEvents';
import {RoomChatData} from '../../events/ui/data/room/RoomChatData';
import {Point} from '../../../utils/point/Point';
import { Disposable } from '../../../core/room/Disposable';

export class RoomLogic implements Disposable {
    private room: RoomLayout;
    private canvasFloorHit: HTMLCanvasElement;
    private canvasWallHit: HTMLCanvasElement;
    private _lastCameraPosition: Point;

    constructor(room: RoomLayout) {
        this.room = room;
        this.canvasFloorHit = this.room.createOrGetRoomCanvas('floorHit');

        if (Engine.getInstance().config.debugRoomClick)
            this.room.visualization.Container.addChild(
                Sprite.from(
                    Texture.from(
                        RenderingUtils.convertCanvasToImage(this.canvasFloorHit)
                    )
                )
            );

        this.canvasWallHit = this.room.createOrGetRoomCanvas('wallHit');
    }

	dispose(): void {}

    registerEvents(): void {
        const roomVisualization = this.room.visualization

        roomVisualization
            .getCanvasFloor()
            .on('pointerover', this.onMouseOver.bind(this));
        roomVisualization.Container.on(
            'pointerdown',
            this.onMouseClick.bind(this)
        );
        roomVisualization.getCanvasFloor().on(
            'pointerout',
            this.onMouseOut.bind(this)
        );
        roomVisualization.container.on(
            'pointerout',
            this.onMouseOut.bind(this)
        );

        Engine.getInstance().application.viewport.on(
            'moved',
            this.onCameraMove.bind(this)
        );

        this.room.getFloorPlane().logic?.registerEvents();
        this.room.getWallPlane().logic?.registerEvents();
    }

    tick(delta: number): void {
        this.room.getWallPlane().logic?.tick(delta);
        this.room.getFloorPlane().logic?.tick(delta);
    }

    getCanvasFloorHit(): HTMLCanvasElement {
        return this.canvasFloorHit;
    }

    getCanvasWallHit(): HTMLCanvasElement {
        return this.canvasWallHit;
    }

    private onCameraMove(e: any) {
        const screen: Point = e.screen
        const viewport: Viewport = e.viewport

        EventManager.emit<RoomChatData>(UIEvents.ROOM_UPDATE_CHAT, {
            x: viewport.x,
            y: viewport.y,
        });

        this._lastCameraPosition =
            Engine.getInstance().roomService.CurrentRoom.roomLayout.getOffset(
                viewport.x,
                viewport.y,
                0
            );
    }

    private onMouseClick(e: any) {

	}

    private onMouseOver(e: any) {
        this.room.visualization.getCanvasPointer().zIndex =
            RoomVisualization.calculateZIndex(
                new Point3d(
                    this.room.getPointer().position.x,
                    this.room.getPointer().position.y,
                    this.room.getPointer().position.z
                ),
                RoomPriority.POINTER
            );
    }

    private onMouseOut() {
        this.room.getPointer().logic.hidePointer();
    }
}
