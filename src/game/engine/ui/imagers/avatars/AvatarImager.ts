import * as PIXI from "pixi.js";
import { Sprite } from "pixi.js";
import { Direction } from "../../../../core/objects/Direction";
import Point from "../../../../utils/point/Point";
import RenderingUtils from "../../../../utils/RenderingUtils";
import Action from "./actions/Action";
import Avatar from "./Avatar";
import AvatarFigure from "./AvatarFigure";
import AvatarFigureComponent from "./AvatarFigureComponent";
import AvatarImageData from "./AvatarImageData";
import AvatarSpriteComponent from "./AvatarSpriteComponent";
import AvatarData from "./enum/AvatarData";
import { IAnimation, IAnimationFrame, OffsetDirection, OffsetFrame } from "./gamedata/IAvatarAnimations";
import { Spritesheet } from "./gamedata/IAvatarResource";
import { IPart } from "./gamedata/IFigureData";
import AvatarStructure from "./structure/AvatarStructure";

export type FigureDataComponent = {
    index: number;
    id: number;
    colorable: boolean;
    color: string | null;
    type: string;
};

export type FigureDataPart = {
    components: FigureDataComponent[]
    hidden: string[]
}

export default class AvatarImager {

    private data: AvatarImageData;
    private structure: AvatarStructure;
    private loader: PIXI.Loader;
    private loaded: boolean = false;
    private parts: any;
    private textures: Map<string, Promise<PIXI.Texture>>

    constructor(structure: AvatarStructure) {
        this.data = new AvatarImageData();
        this.loader = new PIXI.Loader();
        this.textures = new Map();

        this.structure = structure;
    }

    public loadStructure(): void {
        this.structure.setGeometry(this.data.avatarGeometry!.geometry)
        this.structure.setPartSets(this.data.avatarPartSets!);
        this.structure.setAvatarFigureData(this.data.figureData!)
        this.structure.setActions(this.data.avatarActions!)
        this.structure.setAssetsManager(this.data.figureMap!)
        this.structure.setAnimations(this.data.avatarAnimations!)
    }

    public createFigureContainer(figure: string): AvatarFigure {
        return new AvatarFigure(figure)
    }


    public async loadAvatar(avatar: Avatar) {

        if(!this.structure) {
            return;
        }

        this.loadAvatarAssets(avatar);

    }

    public async loadAvatarAssets(avatar: Avatar) {
        for(let part of avatar.AvatarFigure.look) {
            //console.log(part)
            const figurePart = avatar.AvatarFigure.getFigureDataPart(part.type)
            if(!figurePart) {
                return;
            }

            const assets: Set<string> = this.getAssets(figurePart.parts);

            for(let asset of assets) {
                await this.data.loadPart(asset);
            }
        }
    }

    private getAssets(fdParts: IPart[] | undefined): Set<string> {
        const assets = new Set<string>()

        fdParts?.forEach(part => {

            let assetName = this.structure.Assets?.getUniqueName(part.type, part.id)

            if (assetName)
                assets.add(assetName)
        })

        return assets
    }


    public drawAvatar(avatar: Avatar) {
        this.structure.setGeometry(this.data.avatarGeometry?.geometry!)
        const actions = this.structure.Actions?.getActionsByIds(avatar.Actions);

        let figureComponents = avatar.AvatarFigure.getAllComponents()
        let hiddens = avatar.AvatarFigure.getAllHidden()

        figureComponents.sort((a: AvatarFigureComponent, b: AvatarFigureComponent) => {

            let direction = this.structure.Geometry?.isHeadPart(a.part.type) ? avatar.HeadDirection : avatar.BodyDirection
      
            let order = this.getDrawParts("std", direction)

            if(order == null) order = this.getDrawParts("std", avatar.Direction);

            if (order) {
                for (let position of order) {
                    if (position == a.part.type) return -1
                    if (position == b.part.type) return 1
                }
            }

            return 0
        })

        for(let component of figureComponents) {

            if (hiddens.includes(component.part.type)) continue

            let partSet = this.structure.PartSets?.getPart(component.part.type);

            if (!partSet) continue

            let action = this.getFigureComponentAction(component, actions!)
            let assetName = this.Structure.Assets?.getUniqueName(component.part.type, component.part.id)

            if (!action || !assetName) continue

            this.data.loadTexture(assetName).then(() => {
                this.drawPart(component, action!, avatar, assetName!)
            })
        }

        avatar.assemble();
    }
    private getFigureComponentAction(figureComponent: AvatarFigureComponent, actions: Action[]): Action | null | undefined {
        //console.log(actions);
        const action = actions.find((action: Action) => {
            const activeParts = Object.values(this.structure.PartSets?.getActivePartForAction(action)!);

            const activePart = activeParts?.find((part) => {
                return part == figureComponent.part.type;
            });

            return activePart !== undefined;
        });

        return action ?? this.structure.Actions?.getDefaultAction()
    }

    private async drawPart(component: AvatarFigureComponent, action: Action, avatar: Avatar, assetName: string) {

        const partFrames: IAnimationFrame[] = this.structure.Animations?.getAnimation(action.id)?.getAnimationPart(component.part.type)?.getFrames() ?? []
        avatar.TotalFrames = partFrames.length;

        const frame = this.structure.Geometry?.isHeadPart(component.part.type) ? avatar.HeadFrame : avatar.BodyFrame;

        let partFrame: any = frame % (partFrames ? Object.values(partFrames).length : 1);
        let partAction: string = (partFrames && partFrames[partFrame]) ? partFrames[partFrame].assetPartDefinition : action.assetPartDefiniton;

        const direction = avatar.BodyDirection
        const animationOffsets = this.getAnimationOffsets(action.id, partFrame, direction);
     
        partFrame = partFrames && partFrames[partFrame] ? partFrames[partFrame].number : 0;

        const flippedType = this.structure.PartSets?.getFlippedSetType(component.part.type)

        const spriteComponent = new AvatarSpriteComponent(
            partAction,
            component.part.type,
            component.part.id.toString(),
            direction,
            partFrame,
            component.color,
            flippedType,
            avatar.IsSmall,
            partAction
        );

        this.drawSpriteComponent(spriteComponent, assetName, avatar, animationOffsets);
    }


    private async drawSpriteComponent(component: AvatarSpriteComponent, assetName: string, avatar: Avatar, animationOffsets: { x: number, y: number }) {
        let spritesheet: any = await this.data.SpriteSheets.get(assetName) as Spritesheet;

        if(!spritesheet) return;

        const isFlipped = AvatarData.FLIPPED_DIRECTIONS[component.Direction] || false

        component.IsFlipped = isFlipped;

        if(spritesheet[component.ResourceName] !== undefined) {
            let downloadedTexture: PIXI.Texture | null = await this.data.getTexture(assetName)

            if(!downloadedTexture) return;

            let asset = spritesheet[component.ResourceName];
            let texture = RenderingUtils.cropTexture(downloadedTexture, asset.height, asset.width, asset.left, asset.top);
    
            let sprite = new Sprite(texture);
            sprite.interactive = true;
            sprite.buttonMode = true;
    
    
            if (component.Color && component.isColorable) {
                sprite.tint = avatar.IsPlaceHolder ? 0x00000 : parseInt(component.Color, 16);
            }

            let offsets = asset.offset.split(",");

            if(offsets) {

                const offset = new Point(offsets[0], offsets[1])

                sprite.pivot.x = offset.getX()
                sprite.pivot.y = offset.getY()
            }

            if (component.IsFlipped) { 
                sprite.scale.x = -1;
                sprite.x = this.structure.Geometry?.width! - sprite.x + AvatarData.AVATAR_LEFT_OFFSET;
            }
    
    
            if(component.ResourceType == "sh") {
                avatar.ShoesContainer.addChild(sprite);
            } else if(component.ResourceType == "hd" || component.ResourceType == "ey" || component.ResourceType == "fc" || component.ResourceType == "fa" || component.ResourceType == "ea") { 
                avatar.HeadContainer.addChild(sprite);
            } else if(component.ResourceType == "lg") {
                avatar.LegContainer.addChild(sprite);
            } else if(component.ResourceType == "hrb" || component.ResourceType == "ha" ||component.ResourceType == "hbr") {
                avatar.HatContainer.addChild(sprite)
            } else if(component.ResourceType == "he") {
                avatar.HeadAccessoryContainer.addChild(sprite);
            }
            else if(component.ResourceType == "hr") {
                avatar.HairContainer.addChild(sprite)
            }
            else if(component.ResourceType == "bd") {
                avatar.BodyContainer.addChild(sprite)
            }
            else if(component.ResourceType == "rh" || component.ResourceType == "lh" || component.ResourceType == "ls" || component.ResourceType == "rs") {
                avatar.ArmsContainer.addChild(sprite)
            }
            else if( component.ResourceType == "ch")  {
                avatar.TorsoContainer.addChild(sprite)
            } else {
                avatar.Container.addChild(sprite)
            }
        } else {
            //Engine.getInstance().logger?.debug('cannot find resource ' + this.getTextureId(assetName, component.ResourceName))
        }
    }

    private getTextureId(assetName: string, resourceName: string) {
        return resourceName + ".png";
    }
   
    private getAnimationOffsets(actionId: string, frameId: number, directionId: number): { x: number, y: number } {
        
        Object.values(this.data.avatarAnimations!.animations).forEach((animation: IAnimation) => {
            if (animation.id.toLowerCase() === actionId.toLowerCase()) {
                animation.offsets?.frames?.forEach((offset: OffsetFrame) => {
                    offset.directions.forEach((direction: OffsetDirection) => {
                        if(direction.id == frameId) {
                            return {x: direction.bodyParts[0].dx, y: direction.bodyParts[0].dy}
                        }
                    })
                })
            }
        })

        return {x: 0, y: 0}

    }

    private getDrawParts(state: string, direction: Direction): string[] | undefined {
        const drawOrder = this.data.avatarDrawOrder;

        if (drawOrder) {
            return drawOrder[state][direction];
        }
    }

    public get Structure(): AvatarStructure { return this.structure}

    public get Data(): AvatarImageData { return this.data }
}