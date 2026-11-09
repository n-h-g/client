import {ActionsComponent} from '../../../../room/object/entities/components/ActionsComponent';
import {AspectComponent} from '../../../../room/object/entities/components/AspectComponent';
import {HeadBodyRotationComponent} from '../../../../room/object/entities/components/HeadBodyRotation';
import {PositionComponent} from '../../../../room/object/entities/components/PositionComponent';
import {UserComponent} from '../../../../room/object/entities/components/UserComponent';
import {EntityType} from '../../../../room/object/entities/EntityType';

export interface EntityData {
    id: string;
    user: UserComponent;
    aspect: AspectComponent;
    name: {
        name: string;
    };
    rotation: {
        rot: number;
    };
    position: PositionComponent;
    bh_rot: HeadBodyRotationComponent;
    type: EntityType;
    action: ActionsComponent;
    /** A bot (a human without user): its id and the user that owns it (null for the bots of the hotel). */
    bot?: {
        id: number;
        ownerId: number | null;
    };
    /** A pet: its id, its look (type, race, color) and the user that owns it. */
    pet?: {
        id: number;
        type: number;
        race: number;
        color: string;
        ownerId: number | null;
    };
    /** The avatar effect of a human (0: none). */
    effect?: {
        id: number;
    };
    /** What a human carries in its hand (0: nothing), e.g. the coffee of a vending machine. */
    handItem?: {
        id: number;
    };
    /** A furni: its stack height on the server and if something can be placed on it. */
    item?: {
        height?: number;
        allowStack?: boolean;
    };
    /** State of a furni with states (extraData = animation shown). */
    interaction?: {
        extraData?: number | string;
    };
    wallPosition?: string;
}
