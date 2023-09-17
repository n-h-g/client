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
}
