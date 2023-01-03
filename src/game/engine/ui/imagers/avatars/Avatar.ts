import { Container } from "pixi.js";

import { Direction } from "../../../../core/objects/Direction"
import AvatarFigure from "./AvatarFigure";
import { ActionId } from "./enum/actions/ActionId";
import AvatarData from "./enum/AvatarData";
import { AvatarEventsType } from "./enum/events/AvatarEventsType";
import AvatarEvents from "./events/AvatarEvents";
import AvatarStructure from "./structure/AvatarStructure";

const DEFAULT_FIGURE = "hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61";



export type FigurePart = {
    type: string;
    id: string;
    colors: number[];
};

export default class Avatar {
    private look: string;

    private avatarFigure: AvatarFigure;

    private bodyDirection: Direction = AvatarData.DEFAULT_DIRECTION;
    private headDirection: Direction = AvatarData.DEFAULT_DIRECTION;

    private actions: Set<ActionId>;

    private bodyFrame: number;
    private headFrame: number;

    private isSmall: boolean;

    private placeHolder: boolean = false;

    private container: Container;

    private headContainer: Container;
    private bodyContainer: Container;
    private legContainer: Container;
    private shoesContainer: Container;
    private hairContainer: Container;
    private hatContainer: Container;
    private torsoContainer: Container;
    private headAccessoryContainer: Container;
    private armsContainer: Container;
    private faceContainer: Container;

    private totalFrames: number = 0;

    private events: AvatarEvents | null = null;

    // private bodyPartContainers: BodyPartContainers;

    constructor(
        figure: string = DEFAULT_FIGURE,
        bodyDirection: Direction = AvatarData.DEFAULT_DIRECTION,
        headDirecton: Direction = AvatarData.DEFAULT_DIRECTION,
        actions: Set<ActionId>,
        bodyFrame: number = 0,
        headFrame: number = 0,
        isSmall: boolean = false,
        placeholder: boolean = false
    ) {

        this.avatarFigure = new AvatarFigure(figure);

        this.events = new AvatarEvents();

        this.look = figure;

        this.bodyDirection = bodyDirection;
        this.headDirection = headDirecton;

        this.actions = actions

        this.bodyFrame = bodyFrame;

   
        this.headFrame = headFrame;

        this.isSmall = isSmall;

        this.placeHolder = placeholder;
    
        this.container = new Container()
        this.bodyContainer = new Container();
        this.hairContainer = new Container();
        this.headContainer = new Container();
        this.torsoContainer = new Container();
        this.armsContainer = new Container();
        this.legContainer = new Container();
        this.shoesContainer = new Container();
        this.hairContainer = new Container();
        this.hatContainer = new Container();
        this.headAccessoryContainer = new Container();
        this.faceContainer = new Container();

        this.events.on(AvatarEventsType.LOAD_COMPLETE, () => {
            this.assemble()
        })
 
    }

    public assemble(): void {
        this.container.addChild(this.bodyContainer);
        this.container.addChild(this.legContainer);
        this.container.addChild(this.headContainer);
        this.container.addChild(this.hairContainer);
        this.container.addChild(this.shoesContainer);
        this.container.addChild(this.hatContainer);
        this.container.addChild(this.headAccessoryContainer);
        this.container.addChild(this.armsContainer);
        this.container.addChild(this.torsoContainer);
        this.container.addChild(this.faceContainer)

        this.container.sortableChildren = true;

        this.bodyContainer.zIndex = 0;
        this.legContainer.zIndex = 1;
        this.armsContainer.zIndex = 3
        this.torsoContainer.zIndex = 2;
        this.headContainer.zIndex = 4;
        this.hairContainer.zIndex = 5;
        this.shoesContainer.zIndex = 6;
        this.hatContainer.zIndex = 7;
        this.faceContainer.zIndex = 8
        this.headAccessoryContainer.zIndex = 9;
        
        this.container.sortChildren()

        this.container.alpha = this.placeHolder ? 0.5 : 1;
        
        this.container.buttonMode = true;
        this.container.interactive = true;
        this.container.interactiveChildren = true;

        for(let object of this.container.children) {
            object.interactive = true;
        }
    }

    public addAction(action: ActionId) {
        this.actions.add(action);
    }

    public get Look() {
        return this.look;
    }

    public set TotalFrames(frames: number) {
        this.totalFrames = frames;
    }

    public get Frames() {
        return this.totalFrames;
    }

    public get BodyDirection() {
        return this.bodyDirection;
    }

    public get FaceContainer() {
        return this.faceContainer;
    }

    public get HeadDirection() {
        return this.headDirection;
    }

    public get Actions() {
        return this.actions;
    }

    public set Direction(direction: Direction) {
        this.bodyDirection = direction;
        this.headDirection = direction;
    }

    public set Frame(frame: number) {
        this.bodyFrame = frame
        this.headFrame = frame
    }

    public get IsSmall() {
        return this.isSmall;
    }

    public get IsPlaceHolder() {
        return this.placeHolder;
    }

    public get BodyFrame() {
        return this.bodyFrame;
    }

    public get ArmsContainer() {
        return this.armsContainer;
    }

    public set BodyFrame(value: number) {
        this.bodyFrame = value;
    }

    public get HeadFrame() {
        return this.headFrame;
    }

    public get Container() {
        return this.container!;
    }

    public get Events(): AvatarEvents | null{
        return this.events;
    }

    public set Container(container: Container) {
        this.container = container
    }

    public get BodyContainer(): Container {
        return this.bodyContainer;
    }
    public get HeadContainer(): Container {
        return this.headContainer;
    }
    public get ShoesContainer(): Container {
        return this.shoesContainer;
    }
    public get LegContainer(): Container {
        return this.legContainer;
    }
    public get HairContainer(): Container {
        return this.legContainer;
    }

    public get HeadAccessoryContainer(): Container {
        return this.headAccessoryContainer;
    }

    public get HatContainer() {
        return this.hatContainer;
    }
    public get TorsoContainer() {
        return this.torsoContainer;
    }

    public get AvatarFigure(): AvatarFigure {
        return this.avatarFigure;
    }
}
