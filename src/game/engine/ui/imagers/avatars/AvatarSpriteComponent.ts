
import { Direction } from "../../../../core/objects/Direction";
import { IAction } from "./gamedata/IAvatarActions";


export default class AvatarSpriteComponent {
    private state: string;
    private partType: string;
    private resourceType: string
    private partId: string;
    private direction: Direction;
    private resourceDirection: number = 0;
    private frame: number;
    private color: string | null;
    private isFlipped: boolean = false
    private isSmall: boolean;

    private colorable: boolean = true; 

    constructor(state: string, partType: string, partId: string, direction: Direction, frame: number, color: string | null, flippedType: string | undefined, isSmall = false) {
        
        if (partType === "hd" && isSmall)
            this.partId = "1";
        if (partType === "ey" && state === "std" && partId === "1" && direction === 3)
            state = "sml";
        if (partType === "fa" && state === "std" && partId === "2" && (direction === 2 || direction === 4))
            this.resourceDirection = 1;
        if (partType === "he" && state === "std" && partId === "1") {
            if (direction === 2) {
                this.resourceDirection = 0;
            }
    
        }
        if (partType === "he" && state === "std" && partId === "8")
            this.resourceDirection = direction % 2 === 0 ? 1 : this.resourceDirection;
        if (partType === "he" && state === "std" && (partId === "2131" || partId === "2132") && (direction >= 2 && direction <= 6))
            this.resourceDirection = 1;
        if (partType === "ha" && state === "std" && partId === "2518")
            this.resourceDirection = direction % 2 === 0 ? 2 : 1;
        if (partType === "ha" && state === "std" && partId === "2519")
            this.resourceDirection = direction % 2 === 0 ? 2 : 3;
        if (partType === "ha" && state === "std" && partId === "2588")
            this.resourceDirection = 7;
        if (partType === "ha" && state === "std" && partId === "2589")
            this.resourceDirection = 3;
        
        
        this.state = state;

        this.partType = partType;
        this.partId = partId;

        this.direction = direction;

        this.frame = frame;

        this.color = color;

        this.isSmall = isSmall;

        this.resourceDirection = direction

        this.isFlipped = false;

        if(this.resourceDirection > 3 && this.resourceDirection < 7) {
            this.resourceDirection = this.calcFlip(this.resourceDirection);
            this.isFlipped = true;
        }


        if(partType == 'ey') this.colorable = false;

      
        this.resourceType = partType
    }

    public calcFlip = (d: number) => (d > 3 && d < 7 ? 6 - d : d)


    public get isColorable(): boolean {
        return this.colorable
    }


    // h_sit_lg_3596_0_0
    public get ResourceName(): string {
        return (
            (this.isSmall ? "sh" : "h") +
            "_" +
            this.state +
            "_" +
            this.resourceType +
            "_" +
            this.partId +
            "_" +
            this.resourceDirection +
            "_" +
            this.frame
        );
    }

    public get State() {
        return this.state;
    }

    public set State(state: string) {
        this.state = state;
    }

    public get PartType() {
        return this.partType;
    }

    public get ResourceType() {
        return this.resourceType;
    }

    public get PartId() {
        return this.partId;
    }

    public get Direction() {
        return this.direction;
    }

    public get Frame() {
        return this.frame;
    }

    public get Color() {
        return this.color;
    }

    public get IsFlipped() {
        return this.isFlipped;
    }

    public get IsSmall() {
        return this.isSmall;
    }

    public set IsFlipped(flipped: boolean) {
        this.isFlipped = flipped;
    }
    public get ResourceDirection(): number {
        return this.resourceDirection;
    }
    public set ResourceDirection(direction: number) {
        this.resourceDirection = direction;
    }
    public set Frame(frame: number) {
        this.frame = frame;
    }
}
