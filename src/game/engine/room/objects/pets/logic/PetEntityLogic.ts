import {EventManager} from '../../../../../core/events/EventManager';
import {EntityLogic} from '../../../../../core/room/object/entities/EntityLogic';
import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {AvatarContextMenuData} from '../../../../events/ui/data/avatar/AvatarContextMenuData';
import {UIEvents} from '../../../../events/ui/UIEvents';
import type {PetEntity} from '../PetEntity';
import type {PetEntityVisualization} from '../visualization/PetEntityVisualization';
import type {FederatedPointerEvent} from 'pixi.js';

/** A pet in the room: it walks with the steps of the server, it's animated, a click opens its menu. */
export class PetEntityLogic extends EntityLogic {
    tick(delta: number): void {
        const visualization = this.entity.visualization as PetEntityVisualization;

        // moved by a roller
        visualization.updateSlide();
        if (visualization.walking) visualization.move(delta);

        visualization.update(delta);
    }

    /** As the avatars of the others: the user looks at it and its menu opens (the owner can pick it up). */
    onClick(event?: FederatedPointerEvent): void {
        // the click is for the pet, not for the floor under it (the user doesn't walk there)
        event?.stopPropagation();

        const pet = this.entity as PetEntity;
        const engine = Engine.getInstance();

        engine.networkingManager?.packetManager.applyOut(OutgoingPacket.UserLookAtPoint, {
            roomId: engine.roomService?.currentRoom?.id,
            x: pet.position.x,
            y: pet.position.y,
        });

        const bounds = pet.visualization.container.getBounds();
        const ownsRoom = !!engine.currentUsername
            && engine.roomService?.currentRoom?.roomInfo.authorName === engine.currentUsername;

        EventManager.emit<AvatarContextMenuData>(UIEvents.AVATAR_CONTEXT_MENU, {
            id: pet.id,
            name: pet.name,
            x: bounds.x + bounds.width / 2,
            y: bounds.y,
            sitting: false,
            isSelf: false,
            userId: null,
            isPet: true,
            // the server checks it again
            canPickUp: pet.ownerId != null && (pet.ownerId === engine.currentUserId || ownsRoom),
        });
    }

    onMove(delta: number): void {
        this.entity.visualization.move(delta);
    }

    onPositionChanged(): void {}

    onLoad(): void {}
}
