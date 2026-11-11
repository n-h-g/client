import {Container} from 'pixi.js';
import {EntityVisualization} from '../../../../../core/room/object/entities/EntityVisualization';
import {HumanVisualization} from '../../../../../core/room/object/human/visualization/HumanVisualization';
import {Engine} from '../../../../../Engine';
import {Point3d} from '../../../../../utils/point/Point3d';
import {ActionId} from '../../../../ui/imagers/avatars/enum/actions/ActionId';
import {FurniData} from '../../../../ui/imagers/items/FurniData';
import {Pet} from '../../../../ui/imagers/pets/Pet';
import {PetGesture, PetPosture} from '../../../../ui/imagers/pets/PetType';
import {RoomPriority} from '../../../visualization/RoomPriority';
import {RoomVisualization} from '../../../visualization/RoomVisualization';
import {MapData} from '../../map/MapData';
import type {PetEntity} from '../PetEntity';

/**
 * A pet in the room: the Pet of its library (see PetImager) in a container placed as the furni (Nitro draws the pets
 * and the furni with the same geometry: the origin is the center of the tile, at the height of the floor). It walks
 * as the avatars (EntityVisualization.walkTo/move) and is sorted with them.
 */
export class PetEntityVisualization extends EntityVisualization {
    private pet: Pet | null = null;
    private loading = false;
    private posture: string = PetPosture.STAND;
    private headDirection = -1;
    walking = false;

    constructor(entity: PetEntity) {
        super(entity);
        this.container = new Container();
        this.container.sortableChildren = true;
        this.container.eventMode = 'dynamic';
        this.container.cursor = 'pointer';
    }

    private get petEntity(): PetEntity {
        return this.entity as PetEntity;
    }

    /** Adds the pet to the room; its library is loaded the first time (the container is placed already). */
    async render(): Promise<void> {
        const roomContainer = Engine.getInstance().roomService?.currentRoom?.roomLayout.visualization.container;
        if (roomContainer && this.container.parent !== roomContainer) roomContainer.addChild(this.container);

        this.updatePosition();
        this.entity.logic.registerEvents();

        if (this.pet || this.loading) return;

        this.loading = true;
        const pet = await Engine.getInstance().userInterfaceManager?.petImager?.createPet(this.petEntity.petFigure);
        this.loading = false;

        // e.g. picked up while its library was loading
        if (!pet || this.container.destroyed) {
            pet?.destroy();
            return;
        }

        this.pet = pet;
        this.applyState();
        this.container.addChild(pet.container);
        this.entity.logic.registerEvents();
    }

    private applyState(): void {
        if (!this.pet) return;

        this.pet.setDirection(this.direction);
        this.pet.setHeadDirection(this.headDirection);
        this.pet.setPosture(this.posture);
    }

    /** The actions of the server: walking, sitting, lying, else standing (the postures of the pet libraries). */
    setActions(actions: string[]): void {
        this.walking = actions.includes(ActionId.WALK);
        this.posture = this.walking
            ? PetPosture.MOVE
            : actions.includes(ActionId.SIT)
                ? PetPosture.SIT
                : actions.includes(ActionId.LAY)
                    ? PetPosture.LAY
                    : PetPosture.STAND;

        this.pet?.setPosture(this.posture);
    }

    setDirections(body: number, head?: number): void {
        this.direction = body;
        // the head looks where the body looks unless the server turns it
        this.headDirection = head != null && head !== body ? head : -1;
        this.pet?.setDirection(body);
        this.pet?.setHeadDirection(this.headDirection);
    }

    private happyTimer: ReturnType<typeof setTimeout> | undefined;

    /** Scratched: it smiles for a while (as Habbo). */
    showHappy(): void {
        if (!this.pet) return;

        clearTimeout(this.happyTimer);
        this.pet.setGesture(PetGesture.SMILE);
        this.happyTimer = setTimeout(() => this.pet?.setGesture(null), 3000);
    }

    /** The animations of the pet (at the frames per second of Nitro). */
    update(delta: number): void {
        this.pet?.update(delta);
    }

    draw(): void {
        this.pet?.draw();
    }

    nextFrame(): void {}

    updateRotation(rotation: number): void {
        this.setDirections(rotation);
    }

    calculateOffsetX(): number {
        const {x, y} = this.entity.position;
        return ((y - x) * MapData.tileWidth) / 2 + MapData.tileWidth / 2;
    }

    calculateOffsetY(): number {
        const {x, y, z} = this.entity.position;
        // as the furni: the server sends the absolute Z (the floor is 1)
        const heightFromFloor = Math.max(z, 1) - 1;

        return ((y + x) * MapData.tileHeight) / 2 + MapData.tileHeight / 2 - FurniData.FURNI_TOP_OFFSET
            - heightFromFloor * MapData.thickSpace * MapData.stairSteps;
    }

    getZIndex(): number {
        const {x, y, z} = this.entity.position;
        const zIndex = RoomVisualization.calculateZIndex(new Point3d(x, y, z + 0.001), RoomPriority.USER);

        // as the avatars: behind the furni it's behind, in front of the others
        return HumanVisualization.sortWithFloorItems(x, y, zIndex);
    }

    dispose(): void {
        this.pet?.destroy();
        this.pet = null;
        if (!this.container.destroyed) this.container.destroy({children: true});
    }
}
