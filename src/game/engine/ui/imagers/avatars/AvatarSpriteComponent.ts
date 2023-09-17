import {Direction} from '../../../../core/objects/Direction';
import {IAction} from './gamedata/IAvatarActions';

export class AvatarSpriteComponent {
    private state: string;
    private partType: string;
    private resourceType: string;
    private partId: string;
    private direction: Direction;
    private resourceDirection = 0;
    private frame: number;
    private color: string | null;
    private isFlipped = false;
    private isSmall: boolean;

    private colorable = true;

    constructor(
        state: string,
        partType: string,
        partId: string,
        direction: Direction,
        frame: number,
        color: string | null,
        flippedType: string | undefined,
        isSmall = false
    ) {
        if (partType === 'hd' && isSmall)
            this.partId = '1';
        if (
            partType === 'ey' &&
            state === 'std' &&
            partId === '1' &&
            direction === 3
        )
            state = 'sml';
        if (
            partType === 'fa' &&
            state === 'std' &&
            partId === '2' &&
            (direction === 2 || direction === 4)
        )
            this.resourceDirection = 1;
        if (partType === 'he' && state === 'std' && partId === '1') {
            if (direction === 2) {
                this.resourceDirection = 0;
            }

        }
        if (partType === 'he' && state === 'std' && partId === '8')
            this.resourceDirection =
                direction % 2 === 0 ? 1 : this.resourceDirection;
        if (
            partType === 'he' &&
            state === 'std' &&
            (partId === '2131' || partId === '2132') &&
            direction >= 2 &&
            direction <= 6
        )
            this.resourceDirection = 1;
        if (partType === 'ha' && state === 'std' && partId === '2518')
            this.resourceDirection = direction % 2 === 0 ? 2 : 1;
        if (partType === 'ha' && state === 'std' && partId === '2519')
            this.resourceDirection = direction % 2 === 0 ? 2 : 3;
        if (partType === 'ha' && state === 'std' && partId === '2588')
            this.resourceDirection = 7;
        if (partType === 'ha' && state === 'std' && partId === '2589')
            this.resourceDirection = 3;


        this.state = state;

        this.partType = partType;
        this.partId = partId;

        this.direction = direction;

        this.frame = frame;

        this.color = color;

        this.isSmall = isSmall;

        this.resourceDirection = direction;

        this.isFlipped = false;

        if (this.resourceDirection > 3 && this.resourceDirection < 7) {
            this.resourceDirection = this.calcFlip(this.resourceDirection);
            this.isFlipped = true;
        }

        if (partType == 'ey') this.colorable = false;

        this.resourceType = partType;
    }

    calcFlip = (d: number) => (d > 3 && d < 7 ? 6 - d : d);

    get isColorable(): boolean {
        return this.colorable;
    }

    // h_sit_lg_3596_0_0
    get ResourceName(): string {
        return (
            (this.isSmall ? 'sh' : 'h') +
            '_' +
            this.state +
            '_' +
            this.resourceType +
            '_' +
            this.partId +
            '_' +
            this.resourceDirection +
            '_' +
            this.frame
        );
    }

    get State() {
        return this.state;
    }

    set State(state: string) {
        this.state = state;
    }

    get PartType() {
        return this.partType;
    }

    get ResourceType() {
        return this.resourceType;
    }

    get PartId() {
        return this.partId;
    }

    get Direction() {
        return this.direction;
    }

    get Frame() {
        return this.frame;
    }

    get Color() {
        return this.color;
    }

    get IsFlipped() {
        return this.isFlipped;
    }

    get IsSmall() {
        return this.isSmall;
    }

    set IsFlipped(flipped: boolean) {
        this.isFlipped = flipped;
    }
    get ResourceDirection(): number {
        return this.resourceDirection;
    }
    set ResourceDirection(direction: number) {
        this.resourceDirection = direction;
    }
    set Frame(frame: number) {
        this.frame = frame;
    }
}
