import * as PIXI from "pixi.js"
import { Direction } from "../../../../core/objects/Direction"
import { Engine } from '../../../../Engine'
import { Logger } from '../../../../utils/Logger'
import Point from "../../../../utils/point/Point"
import RenderingUtils from "../../../../utils/RenderingUtils"
import Action from "./actions/Action"
import Avatar from "./Avatar"
import AvatarFigure from "./AvatarFigure"
import AvatarFigureComponent from "./AvatarFigureComponent"
import AvatarImageData from "./AvatarImageData"
import AvatarSpriteComponent from "./AvatarSpriteComponent"
import AvatarData from "./enum/AvatarData"
import { BodyPart, IAnimationFrame } from "./gamedata/IAvatarAnimations"
import { AssetData, Spritesheet } from "./gamedata/IAvatarResource"
import { IPart } from "./gamedata/IFigureData"
import AvatarStructure from "./structure/AvatarStructure"
import { Repository } from '../../../../core/Repository'

export type FigureDataComponent = {
    index: number
    id: number
    colorable: boolean
    color: string | null
    type: string
}

export type FigureDataPart = {
    components: FigureDataComponent[]
    hidden: string[]
}

export default class AvatarImager {
    private data: AvatarImageData
    private structure: AvatarStructure
    private loaded: boolean = false
    private parts: any
    private textures: Repository<string, PIXI.Texture>

    constructor(structure: AvatarStructure) {
        this.data = new AvatarImageData()
        this.textures = new Repository()

        this.structure = structure
    }

    public loadStructure(): void {
        this.structure.setGeometry(this.data.avatarGeometry!.geometry)
        this.structure.setPartSets(this.data.avatarPartSets!)
        this.structure.setAvatarFigureData(this.data.figureData!)
        this.structure.setActions(this.data.avatarActions!)
        this.structure.setAssetsManager(this.data.figureMap!)
        this.structure.setAnimations(this.data.avatarAnimations!)
    }

    public createFigureContainer(figure: string): AvatarFigure {
        return new AvatarFigure(figure)
    }


    public async loadAvatar(avatar: Avatar) {
        if (!this.structure) {
            return
        }

        await this.loadAvatarAssets(avatar)
    }

    public async loadAvatarAssets(avatar: Avatar) {
        for (let part of avatar.AvatarFigure.look) {
            //console.log(part)
            const figurePart = avatar.AvatarFigure.getFigureDataPart(part.type)
            if (!figurePart) {
                return
            }

            const assets: Set<string> = this.getAssets(figurePart.parts)

            for (let asset of assets) {
                await this.data.loadPart(asset)
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
        const actions = this.structure.Actions?.getActionsByIds(avatar.Actions)

        let figureComponents = avatar.AvatarFigure.getAllComponents()

        let hiddens = avatar.AvatarFigure.getAllHidden()


        figureComponents.sort((a: AvatarFigureComponent, b: AvatarFigureComponent) => {

            let direction = this.structure.Geometry?.isHeadPart(a.part.type) ? avatar.HeadDirection : avatar.BodyDirection

            let parts = this.getDrawParts("std", direction)

            if (parts == null) parts = this.getDrawParts("std", avatar.Direction)

            if (parts) {
                for (let part of parts) {
                    if (part == a.part.type) return -1
                    if (part == b.part.type) return 1
                }
            }

            return 0
        })

        for (let component of figureComponents) {

            //console.log(component)

            if (hiddens.includes(component.part.type)) continue

            let partSet = this.structure.PartSets?.getPart(component.part.type)

            if (!partSet) continue

            let action = this.getFigureComponentAction(component, actions!)
            let assetName = this.Structure.Assets?.getUniqueName(component.part.type, component.part.id)

            if (!action || !assetName) continue

            this.data.loadTexture(assetName).then(() => {
                this.drawPart(component, action!, avatar, assetName!)
            })
        }

        avatar.assemble()
    }
    private getFigureComponentAction(figureComponent: AvatarFigureComponent, actions: Action[]): Action | null | undefined {
        //console.log(actions)
        const action = actions.find((action: Action) => {
            const activeParts = Object.values(this.structure.PartSets?.getActivePartForAction(action)!)

            const activePart = activeParts?.find((part) => {
                return part == figureComponent.part.type
            })

            return activePart !== undefined
        })

        return action ?? this.structure.Actions?.getDefaultAction()
    }

    private async drawPart(component: AvatarFigureComponent, action: Action, avatar: Avatar, assetName: string) {

        const partFrames: IAnimationFrame[] = this.structure.Animations?.getAnimation(action.id)?.getAnimationPart(component.part.type)?.getFrames() ?? []

        avatar.TotalFrames = partFrames.length

        const direction = avatar.BodyDirection

        const frame = this.structure.Geometry?.isHeadPart(component.part.type) ? avatar.HeadFrame : avatar.BodyFrame

        let partFrame: any = frame % (partFrames ? Object.values(partFrames).length : 1)
        let partAction: string = (partFrames && partFrames[partFrame]) ? partFrames[partFrame].assetPartDefinition : action.assetPartDefiniton


        const offsets = this.structure.Animations?.getAnimation(action.id)?.getAnimationOffset(action.id, partFrame, direction)

        partFrame = partFrames && partFrames[partFrame] ? partFrames[partFrame].number : 0

        /*

        let animationPartState

        let frameNumber = 0

        let offsets

        console.log(action.id)

        if(action.id) {
            let animation = this.structure.Animations.getAnimation(action.id)


            if(animation) {

                let part = animation.getAnimationPart(component.part.type)
                    
                let frames = part.getFrames()

                let animationFrame = avatar.HeadFrame % frames.length

                let frame = frames[animationFrame]

                let frameNumber = frame.number

                offsets = animation ?? animation.offsets.getFrameDirectionParts(frameNumber, direction.valueOf()).bodyParts[0]

                animationPartState = frame.assetPartDefinition
            }
        }

        console.log(animationPartState)*/


        const flippedType = this.structure.PartSets?.getFlippedSetType(component.part.type)

        const spriteComponent = new AvatarSpriteComponent(
            partAction,
            component.part.type,
            component.part.id.toString(),
            direction,
            partFrame,
            component.color,
            flippedType,
            avatar.IsSmall
        )

        const spritesheet = this.data.SpriteSheets.get(assetName) as Spritesheet
        if (!this.textures.has(spriteComponent.ResourceName))
            this.loadTextureIntoCache(spriteComponent.ResourceName, spritesheet, assetName)

        this.drawSpriteComponent(spriteComponent, assetName, avatar, offsets)
    }

    private loadTextureIntoCache(resource: string, spritesheet: Spritesheet, assetName: string): void {
        let asset: AssetData = spritesheet[resource]

        if (!asset)
            return

        if (asset.link != undefined)
            asset = spritesheet[asset.link]

        let downloadedTexture: PIXI.Texture = this.data.getTexture(assetName)
        if (!downloadedTexture) {
            if (Engine.getInstance().config.debug) {
                Logger.debug('Cannot find resource ' + this.getTextureId(resource))
            }
            return
        }

        let texture: PIXI.Texture = RenderingUtils.cropTexture(downloadedTexture, parseInt(asset.height), parseInt(asset.width), parseInt(asset.left), parseInt(asset.top))
        this.textures.add(resource, texture)
    }

    private async drawSpriteComponent(component: AvatarSpriteComponent, assetName: string, avatar: Avatar, bodyPartOffset: BodyPart) {
        const spritesheet: Spritesheet = await this.data.SpriteSheets.get(assetName) as Spritesheet

        if (!spritesheet) return

        component.IsFlipped = AvatarData.FLIPPED_DIRECTIONS[component.Direction] || false

        let asset: AssetData = spritesheet[component.ResourceName]
        if (asset !== undefined) {
            if (asset.link != undefined)
                asset = spritesheet[asset.link]

            const texture = this.textures.get(component.ResourceName)
            const sprite = new PIXI.Sprite(texture)

            sprite.width = parseInt(asset.width)
            sprite.height = parseInt(asset.height)
            sprite.eventMode = 'dynamic'
            sprite.cursor = 'pointer'

            if (component.Color && component.isColorable)
                sprite.tint = avatar.IsPlaceHolder ? 0xFFFFFF : parseInt(component.Color, 16)

            let offsets = asset.offset.split(",")
            if (offsets) {
                const offset = new Point(parseInt(offsets[0]), parseInt(offsets[1]))

                sprite.pivot.x = bodyPartOffset ? bodyPartOffset.dx + offset.getX() : offset.getX()
                sprite.pivot.y = bodyPartOffset ? bodyPartOffset.dy + offset.getY() : offset.getY()
            }

            if (component.IsFlipped) {
                sprite.scale.x = -1
                sprite.x = this.structure.Geometry?.width! - sprite.x + AvatarData.AVATAR_LEFT_OFFSET
            }

            if (component.ResourceType == "sh")
                avatar.ShoesContainer.addChild(sprite)
            else if (component.ResourceType == "hd")
                avatar.HeadContainer.addChild(sprite)
            else if (component.ResourceType == "ey" || component.ResourceType == "fc" || component.ResourceType == "fa" || component.ResourceType == "ea")
                avatar.FaceContainer.addChild(sprite)
            else if (component.ResourceType == "lg")
                avatar.LegContainer.addChild(sprite)
            else if (component.ResourceType == "hrb" || component.ResourceType == "ha" || component.ResourceType == "hbr")
                avatar.HatContainer.addChild(sprite)
            else if (component.ResourceType == "he")
                avatar.HeadAccessoryContainer.addChild(sprite)
            else if (component.ResourceType == "hr")
                avatar.HairContainer.addChild(sprite)
            else if (component.ResourceType == "bd")
                avatar.BodyContainer.addChild(sprite)
            else if (component.ResourceType == "rh" || component.ResourceType == "lh" || component.ResourceType == "ls" || component.ResourceType == "rs")
                avatar.ArmsContainer.addChild(sprite)
            else if (component.ResourceType == "ch")
                avatar.TorsoContainer.addChild(sprite)
            else
                avatar.Container.addChild(sprite)
        } else {
            if (Engine.getInstance().config.debug) {
                Logger.debug('Cannot find resource ' + this.getTextureId(component.ResourceName))
            }
        }
    }

    private getTextureId(resourceName: string) {
        return resourceName + ".png"
    }

    private getDrawParts(state: string, direction: Direction): string[] | undefined {
        const drawOrder = this.data.avatarDrawOrder

        if (drawOrder) {
            return drawOrder[state][direction]
        }
    }

    public get Structure(): AvatarStructure { return this.structure }

    public get Data(): AvatarImageData { return this.data }
}