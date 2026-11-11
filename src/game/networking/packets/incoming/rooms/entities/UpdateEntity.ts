import {EntityData} from '../../../../../core/communication/incoming/rooms/entities/EntityData';
import {EntityType} from '../../../../../core/room/object/entities/EntityType';
import { Human } from '../../../../../core/room/object/human/Human';
import {HumanVisualization} from '../../../../../core/room/object/human/visualization/HumanVisualization';
import {Engine} from '../../../../../Engine';
import {ActionId} from '../../../../../engine/ui/imagers/avatars/enum/actions/ActionId';
import {Logger} from '../../../../../utils/Logger';
import {Point3d} from '../../../../../utils/point/Point3d';
import {MessageHandler} from '../../../../handler/MessageHandler';
import {Item} from '../../../../../engine/room/objects/items/Item';
import {ItemLogic} from '../../../../../core/room/object/items/logic/ItemLogic';
import type {PetEntityVisualization} from '../../../../../engine/room/objects/pets/visualization/PetEntityVisualization';

export class UpdateEntity extends MessageHandler {
    handle(): void {
        const entityData: EntityData = this.message;

        if (Engine.getInstance().roomService?.currentRoom) {
            const entity =
                Engine.getInstance().roomService?.currentRoom?.roomEntityRepository.get(
                    entityData.id
                );

            if (!entity) return;

            if (entityData.type == EntityType.PET) {
                UpdateEntity.updatePet(entity.visualization as PetEntityVisualization, entityData);
                return;
            }

            // new state of a furni (e.g. after a double click): its animation
            if (entityData.interaction?.extraData != null && entityData.type == EntityType.ITEM) {
                const state = Number(entityData.interaction.extraData);
                if (Number.isFinite(state)) (entity.visualization as any).setState?.(state);

                // the furni with other data than a state read it (e.g. the light of a room dimmer)
                (entity as Item).extraData = entityData.interaction.extraData;
                (entity.logic as ItemLogic).onExtraData?.(entityData.interaction.extraData);
            }

            // the server sends the look in every update: the avatar is built again only when it changed
            // (e.g. the wardrobe, a football gate)
            const lookChanged = !!entityData.aspect && entityData.aspect.look !== (entity as Human).figure;
            if (lookChanged) {
                (entity as Human).figure = entityData.aspect.look;
                entity.visualization.render();
            }

            if (entityData.bh_rot && entityData.type == EntityType.HUMAN) {
                const humanVisualization = entity.visualization as HumanVisualization;
                humanVisualization.direction = entityData.bh_rot.body_rot;
                humanVisualization.headRotation = entityData.bh_rot.head_rot;
            }

            // standing up from a seat or a bed to walk: it starts from the base of the furni, as Nitro
            if (entityData.position && entityData.type == EntityType.HUMAN) {
                const humanVisualization = entity.visualization as HumanVisualization;
                const resting = (actions?: Iterable<ActionId>) =>
                    !!actions && [...actions].some(action => action === ActionId.SIT || action === ActionId.LAY);

                const wasResting = resting(humanVisualization.actions);
                const isResting = entityData.action ? resting(entityData.action.actions) : wasResting;

                if (wasResting && !isResting) humanVisualization.standUp(entityData.position.z);
            }

            if (entityData.position) {
                if (entityData.rotation) {
                    entity.visualization.updateRotation(
                        entityData.rotation.rot
                    );
                }

                const nextPosition = new Point3d(
                    entityData.position.x,
                    entityData.position.y,
                    entityData.position.z
                );

                // Walking entities interpolate x, y and z in EntityVisualization.move(), one step at a time (an
                // avatar behind, e.g. after a pause of the page, jumps to its previous step: see walkTo).
                // Furni and humans that are not walking go directly to the new position:
                // e.g. the final step on a bed/chair, or a furni placed/moved under a standing user.
                const isWalking =
                    entityData.action?.actions?.includes(ActionId.WALK) ?? false;

                if (entityData.type == EntityType.HUMAN && isWalking) {
                    entity.visualization.walkTo(nextPosition);
                } else {
                    entity.visualization.setNextPosition(nextPosition);
                }

                if (entityData.type == EntityType.ITEM || (entityData.action && !isWalking)) {
                    entity.visualization.snapToNextPosition();
                }

                entity.visualization.needsUpdate =
                    entity.position.x != entityData.position.x ||
                    entity.position.y != entityData.position.y ||
                    entity.position.z != entityData.position.z ||
                    lookChanged;
            }

            // before the actions (they can stop here): the effect is drawn when its library is loaded
            if (entityData.effect && entityData.type == EntityType.HUMAN) {
                (entity.visualization as HumanVisualization).setEffect(entityData.effect.id);
            }

            if (entityData.handItem && entityData.type == EntityType.HUMAN) {
                (entity.visualization as HumanVisualization).setHandItem(entityData.handItem.id);
            }

            if (entityData.action) {
                const humanVisualization = entity.visualization as HumanVisualization;
                humanVisualization.danceStyle = entityData.action.danceStyle ?? 1;
                humanVisualization.onFurni = entityData.action.onFurni ?? false;
                humanVisualization.signValue = entityData.action.signValue ?? 1;
                // The server sends the complete action set. Reconcile it rather
                // than accumulating stale gestures from previous menu actions.
                humanVisualization.actions.clear();
                if (entityData.action.actions.length == 0) {
                    humanVisualization.addAction(ActionId.STAND);
                    humanVisualization.needsUpdate = false;
                    entity.visualization.render();
                    return;
                }

                for (const action of entityData.action.actions) {
                    humanVisualization.addAction(action);
                }

                humanVisualization.needsUpdate = humanVisualization.actions.has(ActionId.DANCE) || humanVisualization.actions.has(ActionId.WAVE) || humanVisualization.actions.has(ActionId.RESPECT) || humanVisualization.actions.has(ActionId.LAUGH) || humanVisualization.actions.has(ActionId.BLOW) || humanVisualization.actions.has(ActionId.WALK) || humanVisualization.hasAnimatedEffect;

                entity.visualization.render();
            } else if (entityData.bh_rot && entityData.type == EntityType.HUMAN) {
                entity.visualization.draw();
            }
        } else {
            if (Engine.getInstance().config.debug) {
                Logger.debug('Invalid current room');
            }
        }
    }

    /** A pet: it walks its steps as the avatars, its actions become its posture (mv, sit, lay, std). */
    private static updatePet(visualization: PetEntityVisualization, data: EntityData): void {
        // ridden or not (a horse)
        if (data.pet) {
            (visualization.entity as {riderId?: string | null}).riderId = data.pet.rider ?? null;
            visualization.setRiding(data.pet.rider != null);
        }

        if (data.bh_rot) visualization.setDirections(data.bh_rot.body_rot, data.bh_rot.head_rot);
        if (data.action) visualization.setActions(data.action.actions ?? []);

        if (!data.position) return;

        const next = new Point3d(data.position.x, data.position.y, data.position.z);
        const walking = data.action?.actions?.includes(ActionId.WALK) ?? visualization.walking;

        if (walking) {
            visualization.walkTo(next);
        } else {
            visualization.setNextPosition(next);
            visualization.snapToNextPosition();
        }
    }
}
