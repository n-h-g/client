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
        let resDir = direction;

        //console.log(state)


        if (state === 'lay') {
            resDir = (direction > 3 && direction < 7) ? 4 : 2;
        }


        if (partType === 'hd' && isSmall) this.partId = '1';
        
        if (partType === 'ey' && state === 'std' && partId === '1' && direction === 3) {
            this.state = 'sml';
        }

        if (partType === 'fa' && state === 'std' && partId === '2' && (direction === 2 || direction === 4)) {
            resDir = 1;
        }

        if (partType === 'he' && state === 'std') {
            if (partId === '1' && direction === 2) resDir = 0;
            if (partId === '8' && direction % 2 === 0) resDir = 1;
            if ((partId === '2131' || partId === '2132') && direction >= 2 && direction <= 6) resDir = 1;
        }

        if (partType === 'ha' && state === 'std') {
            if (partId === '2518') resDir = direction % 2 === 0 ? 2 : 1;
            if (partId === '2519') resDir = direction % 2 === 0 ? 2 : 3;
            if (partId === '2588') resDir = 7;
            if (partId === '2589') resDir = 3;
        }

            if (state === 'sit') {
            if (direction === 1 || direction === 3) resDir = 2;
            if (direction === 5) resDir = 4;
            if (direction === 7) resDir = 6;
        }

        this.state = state;

        this.partType = partType;
        this.partId = partId;

        this.direction = direction;

        this.frame = frame;

        this.color = color;

        this.isSmall = isSmall;

        this.resourceDirection = direction;

        this.isFlipped = false;

        if (resDir > 3 && resDir < 7) {
            this.resourceDirection = this.calcFlip(resDir);
            this.isFlipped = true;
        } else {
            this.resourceDirection = resDir;
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
