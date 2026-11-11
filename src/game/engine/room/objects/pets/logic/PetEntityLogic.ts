import {EventManager} from '../../../../../core/events/EventManager';
import {EntityLogic} from '../../../../../core/room/object/entities/EntityLogic';
import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {AvatarContextMenuData} from '../../../../events/ui/data/avatar/AvatarContextMenuData';
import {UIEvents} from '../../../../events/ui/UIEvents';
import {PreviewModeEventData} from '../../../../events/ui/data/general/PreviewUserData';
import {IComponentShowableUI} from '../../../../../core/ui/IComponentShowableUI';
import {UIComponent} from '../../../../ui/components/UIComponent';
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

        void this.showCard(pet);

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
            isPetOwner: pet.ownerId != null && pet.ownerId === engine.currentUserId,
            canRide: pet.canBeRidden && pet.riderId == null && PetEntityLogic.ridingPet() == null,
            isRiding: pet.riderId != null && pet.riderId === PetEntityLogic.ownEntityId(),
            // the server checks it again
            canPickUp: pet.ownerId != null && (pet.ownerId === engine.currentUserId || ownsRoom),
        });
    }

    /** The entity of the user itself in the room, null if it isn't there. */
    static ownEntityId(): string | null {
        const engine = Engine.getInstance();

        for (const entity of engine.roomService?.currentRoom?.roomEntityRepository?.getAll().values() ?? []) {
            const user = entity as {userId?: number | null; isBot?: boolean; id: string};
            if (!user.isBot && user.userId != null && user.userId === engine.currentUserId) return user.id;
        }

        return null;
    }

    /** The horse the user rides, null if it rides none. */
    static ridingPet(): PetEntity | null {
        const own = PetEntityLogic.ownEntityId();
        if (!own) return null;

        for (const entity of Engine.getInstance().roomService?.currentRoom?.roomEntityRepository?.getAll().values() ?? []) {
            const pet = entity as Partial<PetEntity>;
            if (pet.riderId === own) return entity as PetEntity;
        }

        return null;
    }

    /** The card of the pet on the right (as the one of the users): its image standing, its type, its scratches. */
    private async showCard(pet: PetEntity): Promise<void> {
        const engine = Engine.getInstance();
        if (engine.config.offlineMode) return;

        engine.userInterfaceManager?.componentsManager
            ?.getComponent<IComponentShowableUI>(UIComponent.PreviewBoxUI)
            .show();

        const data = (image: string): PreviewModeEventData => ({
            id: pet.id,
            mode: 'pet',
            name: pet.name,
            image,
            petType: pet.petFigure.typeId,
            petRespects: pet.respects,
            petOwner: this.ownerName(pet),
        });

        // the card at once, its image when it's drawn (the first time the library may still be loading)
        EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, data(''));

        const image = await engine.userInterfaceManager?.petImager?.getImage(pet.petFigure, {direction: 2});
        if (image) EventManager.emit<PreviewModeEventData>(UIEvents.PREVIEW_BOX_MODE, data(image));
    }

    /** The name of the owner: known if it's the user or if it's in the room. */
    private ownerName(pet: PetEntity): string | undefined {
        const engine = Engine.getInstance();
        if (pet.ownerId == null) return undefined;
        if (pet.ownerId === engine.currentUserId) return engine.currentUsername ?? undefined;

        for (const entity of engine.roomService?.currentRoom?.roomEntityRepository?.getAll().values() ?? []) {
            const user = entity as {userId?: number | null; isBot?: boolean; name: string};
            if (!user.isBot && user.userId === pet.ownerId) return user.name;
        }

        return undefined;
    }

    onMove(delta: number): void {
        this.entity.visualization.move(delta);
    }

    onPositionChanged(): void {}

    onLoad(): void {}
}
