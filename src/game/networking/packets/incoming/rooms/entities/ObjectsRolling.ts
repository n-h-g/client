import {Engine} from '../../../../../Engine';
import {Point3d} from '../../../../../utils/point/Point3d';
import {MessageHandler} from '../../../../handler/MessageHandler';

/**
 * The furni and the avatars moved by the rollers (Nitro's ObjectsRollingMessage): each one slides to its new
 * position in the given time, without walking.
 */
export class ObjectsRolling extends MessageHandler {
    handle(): void {
        const moves: {id: string; x: number; y: number; z: number}[] = this.message?.data ?? [];
        const duration: number = this.message?.duration ?? 500;
        const repository = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository;

        if (!repository) return;

        for (const move of moves) {
            const entity = repository.get(move.id);
            if (!entity?.visualization) continue;

            entity.visualization.slideTo(new Point3d(move.x, move.y, move.z), duration);
        }

        // the footprints of the furni changed (the placement preview, the floor holes...)
        repository.onFloorItemsChanged();
    }
}
