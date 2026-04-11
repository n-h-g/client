import * as PIXI from 'pixi.js';
import {Direction} from '../../../../core/objects/Direction';
import {Engine} from '../../../../Engine';
import {Logger} from '../../../../utils/Logger';
import {Point} from '../../../../utils/point/Point';
import {RenderingUtils} from '../../../../utils/RenderingUtils';
import {Action} from './actions/Action';
import {Avatar} from './Avatar';
import {AvatarFigure} from './AvatarFigure';
import {AvatarFigureComponent} from './AvatarFigureComponent';
import {AvatarImageData} from './AvatarImageData';
import {AvatarSpriteComponent} from './AvatarSpriteComponent';
import {AvatarData} from './enum/AvatarData';
import {BodyPart, IAnimationFrame} from './gamedata/IAvatarAnimations';
import {AssetData, Spritesheet} from './gamedata/IAvatarResource';
import {IPart} from './gamedata/IFigureData';
import {AvatarStructure} from './structure/AvatarStructure';
import {Repository} from '../../../../core/Repository';

export type FigureDataComponent = {
    index: number;
    id: number;
    colorable: boolean;
    color: string | null;
    type: string;
};

export type FigureDataPart = {
    components: FigureDataComponent[];
    hidden: string[];
};

export class AvatarImager {
    private data: AvatarImageData;
    private structure: AvatarStructure;
    private loaded = false;
    private parts: any;
    private textures: Repository<string, PIXI.Texture>;

    private spritePool: PIXI.Sprite[] = [];

    constructor(structure: AvatarStructure) {
        this.data = new AvatarImageData();
        this.textures = new Repository();
        this.structure = structure;
    }

    loadStructure(): void {
        this.structure.setGeometry(this.data.avatarGeometry!.geometry);
        this.structure.setPartSets(this.data.avatarPartSets!);
        this.structure.setAvatarFigureData(this.data.figureData!);
        this.structure.setActions(this.data.avatarActions!);
        this.structure.setAssetsManager(this.data.figureMap!);
        this.structure.setAnimations(this.data.avatarAnimations!);
    }

    createFigureContainer(figure: string): AvatarFigure {
        return new AvatarFigure(figure);
    }

    async loadAvatar(avatar: Avatar) {
        if (!this.structure) {
            return;
        }

        await this.loadAvatarAssets(avatar);
    }

    async loadAvatarAssets(avatar: Avatar) {
        for (const part of avatar.AvatarFigure.look) {
            const figurePart = avatar.AvatarFigure.getFigureDataPart(part.type);
            if (!figurePart) {
                return;
            }

            const assets: Set<string> = this.getAssets(figurePart.parts);

            for (const asset of assets) {
                await this.data.loadPart(asset);
            }
        }
    }

    private getAssets(fdParts: IPart[] | undefined): Set<string> {
        const assets = new Set<string>();

        fdParts?.forEach(part => {
            const assetName = this.structure.Assets?.getUniqueName(
                part.type,
                part.id
            );

            if (assetName) assets.add(assetName);
        });

        return assets;
    }

    private clearAvatarContainers(avatar: Avatar) {
        const subContainers = [
            avatar.ShadowContainer,
            avatar.BodyContainer, avatar.LegContainer, avatar.HeadContainer,
            avatar.HairContainer, avatar.ShoesContainer, avatar.HatContainer,
            avatar.HeadAccessoryContainer, avatar.ArmsContainer, avatar.TorsoContainer,
            avatar.FaceContainer
        ];

        for (const container of subContainers) {
            while (container.children.length > 0) {
                const child = container.children[0] as PIXI.Sprite;
                container.removeChild(child);
                this.spritePool.push(child);
            }
        }

        for (let i = avatar.Container.children.length - 1; i >= 0; i--) {
            const child = avatar.Container.children[i];
            if (!subContainers.includes(child as PIXI.Container)) {
                avatar.Container.removeChild(child);
                this.spritePool.push(child as PIXI.Sprite);
            }
        }
    }

    async drawAvatar(avatar: Avatar) {
        this.clearAvatarContainers(avatar);

        this.structure.setGeometry(this.data.avatarGeometry?.geometry!);
        const actions = this.structure.Actions?.getActionsByIds(avatar.Actions);

        const figureComponents = avatar.AvatarFigure.getAllComponents();
        const hiddens = avatar.AvatarFigure.getAllHidden();

        if(!avatar.isUI)
        {
            const shadowPart: IPart = {
                type: 'sd',
                id: 1,
                index: 0,
                colorable: false,
                colorindex: 0
            };

            const shadowComponent = new AvatarFigureComponent(shadowPart, ""); 
            figureComponents.push(shadowComponent);
        }

        figureComponents.sort(
            (a: AvatarFigureComponent, b: AvatarFigureComponent) => {
                const direction = this.structure.Geometry?.isHeadPart(
                    a.part.type
                )
                    ? avatar.HeadDirection
                    : avatar.BodyDirection;

                let parts = this.getDrawParts('std', direction);

                if (parts == null)
                    parts = this.getDrawParts('std', avatar.Direction);

                if (parts) {
                    for (const part of parts) {
                        if (part == a.part.type) return -1;
                        if (part == b.part.type) return 1;
                    }
                }

                return 0;
            }
        );

        const assetGroups = new Map<string, AvatarFigureComponent[]>();

        for (const component of figureComponents) {
            if (hiddens.includes(component.part.type)) continue;
            
            if(component.part.type != 'sd') 
            {
                const partSet = this.structure.PartSets?.getPart(component.part.type);
                if (!partSet) continue;
            }

            const action = this.getFigureComponentAction(component, actions!);
            const assetName = this.Structure.Assets?.getUniqueName(component.part.type, component.part.id);

            if (!action || !assetName) continue;

            if (!assetGroups.has(assetName)) assetGroups.set(assetName, []);
            assetGroups.get(assetName)!.push(component);
        }

        await Promise.all(Array.from(assetGroups.keys()).map(asset => this.data.loadTexture(asset)));

        for (const [assetName, components] of assetGroups) {
            for (const component of components) {
                //console.log(component)
                const action = this.getFigureComponentAction(component, actions!);
                await this.drawPart(component, action!, avatar, assetName);
            }
        }
    
        avatar.assemble();
    }

    private getFigureComponentAction(
        figureComponent: AvatarFigureComponent,
        actions: Action[]
    ): Action | null | undefined {
        const action = actions.find((action: Action) => {
            const activeParts = Object.values(
                this.structure.PartSets?.getActivePartForAction(action)!
            );

            const activePart = activeParts?.find(part => {
                return part == figureComponent.part.type;
            });

            return activePart !== undefined;
        });

        return action ?? this.structure.Actions?.getDefaultAction();
    }

    private async drawPart(
        component: AvatarFigureComponent,
        action: Action,
        avatar: Avatar,
        assetName: string
    ) {
        const partFrames: IAnimationFrame[] =
            this.structure.Animations?.getAnimation(action.id)
                ?.getAnimationPart(component.part.type)
                ?.getFrames() ?? [];

        avatar.TotalFrames = partFrames.length;

        const direction = component.part.type == 'sd' ? 0 : avatar.BodyDirection;

        const frame = this.structure.Geometry?.isHeadPart(component.part.type)
            ? avatar.HeadFrame
            : avatar.BodyFrame;

        let partFrame: any =
            frame % (partFrames && Object.values(partFrames).length > 0 ? Object.values(partFrames).length : 1);
            
        const partAction: string =
            partFrames && partFrames[partFrame]
                ? partFrames[partFrame].assetPartDefinition
                : action.assetPartDefiniton;

        const offsets = this.structure.Animations?.getAnimation(
            action.id
        )?.getAnimationOffset(action.id, partFrame, direction);

        partFrame =
            partFrames && partFrames[partFrame]
                ? partFrames[partFrame].number
                : 0;

        const flippedType = this.structure.PartSets?.getFlippedSetType(
            component.part.type
        );

        const spriteComponent = new AvatarSpriteComponent(
            partAction,
            component.part.type,
            component.part.id.toString(),
            direction,
            partFrame,
            component.color,
            flippedType,
            avatar.IsSmall
        );

        const spritesheet = this.data.SpriteSheets.get(
            assetName
        ) as Spritesheet;
        
        if (!this.textures.has(spriteComponent.ResourceName)) {
            this.loadTextureIntoCache(
                spriteComponent.ResourceName,
                spritesheet,
                assetName
            );
        }

        this.drawSpriteComponent(spriteComponent, assetName, avatar, offsets);
    }

    private loadTextureIntoCache(
        resource: string,
        spritesheet: Spritesheet,
        assetName: string
    ): void {
        let asset: AssetData = spritesheet[resource];

        if (!asset) return;

        if (asset.link != undefined) asset = spritesheet[asset.link];

        const downloadedTexture: PIXI.Texture = this.data.getTexture(assetName) as PIXI.Texture;
        if (!downloadedTexture) {
            if (Engine.getInstance().config.debug) {
                Logger.debug(
                    'Cannot find resource ' + this.getTextureId(resource)
                );
            }
            return;
        }

        const texture: PIXI.Texture = RenderingUtils.cropTexture(
            downloadedTexture,
            parseInt(asset.left),
            parseInt(asset.top),
            parseInt(asset.width),
            parseInt(asset.height),
        );
        this.textures.add(resource, texture);
    }

    private async drawSpriteComponent(
        component: AvatarSpriteComponent,
        assetName: string,
        avatar: Avatar,
        bodyPartOffset: BodyPart | undefined
    ) {
        const spritesheet: Spritesheet = (await this.data.SpriteSheets.get(
            assetName
        )) as Spritesheet;

        if (!spritesheet) return;

        component.IsFlipped =
            AvatarData.FLIPPED_DIRECTIONS[component.Direction] || false;

        let asset: AssetData = spritesheet[component.ResourceName];
        if (asset !== undefined) {
            if (asset.link != undefined) asset = spritesheet[asset.link];

            const texture = this.textures.get(component.ResourceName);
            
            let sprite = this.spritePool.pop();
            if (!sprite) {
                sprite = new PIXI.Sprite();
            }
            
            // Apply new texture
            sprite.texture = texture;

            // Reset scale, pivot, and position before calculating new ones
            sprite.scale.set(1, 1);
            sprite.pivot.set(0, 0);
            sprite.x = 0;
            sprite.y = 0;
            sprite.tint = 0xFFFFFF;

            sprite.width = parseInt(asset.width);
            sprite.height = parseInt(asset.height);
            sprite.eventMode = 'dynamic';
            sprite.cursor = 'pointer';

            if (component.Color && component.isColorable) {
                sprite.tint = avatar.IsPlaceHolder
                    ? 0xffffff
                    : parseInt(component.Color, 16);
            }

            const offsets = asset.offset.split(',');
            if (offsets) {
                const offset = new Point(
                    parseInt(offsets[0]),
                    parseInt(offsets[1])
                );

                sprite.pivot.x = bodyPartOffset
                    ? bodyPartOffset.dx + offset.x
                    : offset.x;
                sprite.pivot.y = bodyPartOffset
                    ? bodyPartOffset.dy + offset.y
                    : offset.y;
            }

            if (component.IsFlipped) {
                sprite.scale.x = -1;
                sprite.x =
                    this.structure.Geometry?.width! -
                    sprite.x +
                    (component.ResourceType == 'sd' ? AvatarData.SHADOW_OFFSET_X : AvatarData.AVATAR_LEFT_OFFSET);
            }

            if (component.ResourceType == 'sd') {
                sprite.alpha = 0.2;
                sprite.tint = 0x000000;
                avatar.ShadowContainer.addChild(sprite);
            }
            if (component.ResourceType == 'sh')
                avatar.ShoesContainer.addChild(sprite);
            else if (component.ResourceType == 'hd')
                avatar.HeadContainer.addChild(sprite);
            else if (
                component.ResourceType == 'ey' ||
                component.ResourceType == 'fc' ||
                component.ResourceType == 'fa' ||
                component.ResourceType == 'ea'
            )
                avatar.FaceContainer.addChild(sprite);
            else if (component.ResourceType == 'lg')
                avatar.LegContainer.addChild(sprite);
            else if (
                component.ResourceType == 'hrb' ||
                component.ResourceType == 'ha' ||
                component.ResourceType == 'hbr'
            )
                avatar.HatContainer.addChild(sprite);
            else if (component.ResourceType == 'he')
                avatar.HeadAccessoryContainer.addChild(sprite);
            else if (component.ResourceType == 'hr')
                avatar.HairContainer.addChild(sprite);
            else if (component.ResourceType == 'bd')
                avatar.BodyContainer.addChild(sprite);
            else if (
                component.ResourceType == 'rh' ||
                component.ResourceType == 'lh' ||
                component.ResourceType == 'ls' ||
                component.ResourceType == 'rs'
            )
                avatar.ArmsContainer.addChild(sprite);
            else if (component.ResourceType == 'ch')
                avatar.TorsoContainer.addChild(sprite);
            else avatar.Container.addChild(sprite);
        } else {
            if (Engine.getInstance().config.debug) {
                Logger.debug(
                    'Cannot find resource ' +
                        this.getTextureId(component.ResourceName)
                );
            }
        }
    }

    private getTextureId(resourceName: string) {
        return resourceName + '.png';
    }

    private getDrawParts(
        state: string,
        direction: Direction
    ): string[] | undefined {
        const drawOrder = this.data.avatarDrawOrder;

        if (drawOrder) {
            return drawOrder[state][direction];
        }
    }

    get Structure(): AvatarStructure {
        return this.structure;
    }

    get Data(): AvatarImageData {
        return this.data;
    }
}