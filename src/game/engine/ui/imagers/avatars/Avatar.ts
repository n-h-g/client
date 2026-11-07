import {Container} from 'pixi.js';

import {Direction} from '../../../../core/objects/Direction';
import {AvatarFigure} from './AvatarFigure';
import {ActionId} from './enum/actions/ActionId';
import {AvatarData} from './enum/AvatarData';
import {AvatarEventsType} from './enum/events/AvatarEventsType';
import {AvatarEvents} from './events/AvatarEvents';
import type {AvatarEffect} from './effects/AvatarEffect';

const DEFAULT_FIGURE =
    'hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61';

export type FigurePart = {
    type: string;
    id: string;
    colors: number[];
};

export class Avatar {
    private look: string;

    private avatarFigure: AvatarFigure;

    private bodyDirection: Direction = AvatarData.DEFAULT_DIRECTION;
    private headDirection: Direction = AvatarData.DEFAULT_DIRECTION;

    private actions: Set<ActionId>;

    private bodyFrame: number;
    private headFrame: number;

    private isSmall: boolean;

    private placeHolder = false;

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
    private shadowContainer: Container;

    private totalFrames = 0;

    private events: AvatarEvents | null = null;
    private ui: boolean;
    private danceStyle: number;
    private signValue: number;
    private onFurni: boolean;
    /** The effect drawn with the avatar (loaded), null without effect. */
    private effect: AvatarEffect | null = null;
    private directionOffset = 0;

    constructor(
        figure: string = DEFAULT_FIGURE,
        bodyDirection: Direction = AvatarData.DEFAULT_DIRECTION,
        headDirecton: Direction = AvatarData.DEFAULT_DIRECTION,
        actions: Set<ActionId>,
        bodyFrame = 0,
        headFrame = 0,
        isSmall = false,
        placeholder = false,
        ui: boolean = false,
        danceStyle = 1,
        signValue = 1,
        onFurni = false
    ) {
        this.avatarFigure = new AvatarFigure(figure);

        this.events = new AvatarEvents();

        this.look = figure;

        this.bodyDirection = bodyDirection;
        this.headDirection = headDirecton;

        this.ui = ui;
        this.danceStyle = danceStyle;
        this.signValue = signValue;
        this.onFurni = onFurni;

        this.actions = actions;

        this.bodyFrame = bodyFrame;

        this.headFrame = headFrame;

        this.isSmall = isSmall;

        this.placeHolder = placeholder;

        this.container = new Container();
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
        this.shadowContainer = new Container();

        this.container.cursor = 'pointer';
        this.container.eventMode = 'dynamic';
        this.container.interactiveChildren = false;

        /*this.events.on(AvatarEventsType.LOAD_COMPLETE, () => {
            this.assemble()
        })*/
    }

    assemble(): void {
        this.container.addChild(this.bodyContainer);
        this.container.addChild(this.legContainer);
        this.container.addChild(this.headContainer);
        this.container.addChild(this.hairContainer);
        this.container.addChild(this.shoesContainer);
        this.container.addChild(this.hatContainer);
        this.container.addChild(this.headAccessoryContainer);
        this.container.addChild(this.armsContainer);
        this.container.addChild(this.torsoContainer);
        this.container.addChild(this.faceContainer);
        this.container.addChild(this.shadowContainer);

        this.container.sortableChildren = true;

        this.bodyContainer.zIndex = 0;
        this.legContainer.zIndex = 1;
        this.armsContainer.zIndex = 3;
        this.torsoContainer.zIndex = 2;
        this.headContainer.zIndex = 4;
        this.hairContainer.zIndex = 5;
        this.shoesContainer.zIndex = 6;
        this.hatContainer.zIndex = 7;
        this.faceContainer.zIndex = 8;
        this.headAccessoryContainer.zIndex = 9;
        // the shadow is on the floor, under all the parts
        this.shadowContainer.zIndex = -1;

        this.container.sortChildren();

        this.container.alpha = this.placeHolder ? 0.5 : 1;

        this.container.cursor = 'pointer';
        this.container.eventMode = 'dynamic';
        this.container.interactiveChildren = true;

        for (const object of this.container.children) {
            object.eventMode = 'dynamic';
        }

        this.events.emit(AvatarEventsType.LOAD_COMPLETE);
    }

    addAction(action: ActionId) {
        this.actions.add(action);
    }

    get isUI() {
        return this.ui;
    }

    get DanceStyle() {
        return this.danceStyle;
    }

    set DanceStyle(style: number) {
        this.danceStyle = style;
    }

    get Effect(): AvatarEffect | null {
        return this.effect;
    }

    set Effect(effect: AvatarEffect | null) {
        this.effect = effect;
    }

    /**
     * Turns the body and the head by the offset (an effect that turns the avatar, e.g. the hoverboard).
     * As Nitro's AvatarImage.setDirection the direction goes around 0..7. Setting it again replaces the offset.
     */
    setDirectionOffset(offset: number) {
        const delta = offset - this.directionOffset;
        if (!delta) return;

        this.directionOffset = offset;
        this.bodyDirection = ((this.bodyDirection + delta) % 8 + 8) % 8;
        this.headDirection = ((this.headDirection + delta) % 8 + 8) % 8;
    }

    /** The containers of the figure parts (not the shadow): what an effect colors. */
    get PartContainers(): Container[] {
        return [
            this.bodyContainer, this.legContainer, this.headContainer, this.hairContainer,
            this.shoesContainer, this.hatContainer, this.headAccessoryContainer,
            this.armsContainer, this.torsoContainer, this.faceContainer,
        ];
    }

    get SignValue() {
        return this.signValue;
    }

    get Look() {
        return this.look;
    }

    set TotalFrames(frames: number) {
        this.totalFrames = frames;
    }

    get Frames() {
        return this.totalFrames;
    }

    get BodyDirection() {
        return this.bodyDirection;
    }

    get FaceContainer() {
        return this.faceContainer;
    }

    get HeadDirection() {
        return this.headDirection;
    }

    get Actions() {
        return this.actions;
    }

    get OnFurni(): boolean {
        return this.onFurni;
    }

    set Direction(direction: Direction) {
        this.bodyDirection = direction;
        this.headDirection = direction;
    }

    set Frame(frame: number) {
        this.bodyFrame = frame;
        this.headFrame = frame;
    }

    get IsSmall() {
        return this.isSmall;
    }

    get IsPlaceHolder() {
        return this.placeHolder;
    }

    get BodyFrame() {
        return this.bodyFrame;
    }

    get ArmsContainer() {
        return this.armsContainer;
    }

    set BodyFrame(value: number) {
        this.bodyFrame = value;
    }

    get HeadFrame() {
        return this.headFrame;
    }

    get Container() {
        return this.container!;
    }

    get Events(): AvatarEvents | null {
        return this.events;
    }

    set Container(container: Container) {
        this.container = container;
    }

    get BodyContainer(): Container {
        return this.bodyContainer;
    }
    get HeadContainer(): Container {
        return this.headContainer;
    }
    get ShoesContainer(): Container {
        return this.shoesContainer;
    }
    get LegContainer(): Container {
        return this.legContainer;
    }
    get HairContainer(): Container {
        // it returned the leg container: the hair was drawn with the legs (under the head)
        return this.hairContainer;
    }

    get ShadowContainer(): Container {
        return this.shadowContainer;
    }

    get HeadAccessoryContainer(): Container {
        return this.headAccessoryContainer;
    }

    get HatContainer() {
        return this.hatContainer;
    }
    get TorsoContainer() {
        return this.torsoContainer;
    }

    get AvatarFigure(): AvatarFigure {
        return this.avatarFigure;
    }
}
