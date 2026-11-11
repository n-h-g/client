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
import {getDanceBodyPart, getDanceFrameCount} from './animation/DanceAnimations';
import {BodyPartLayers} from './animation/BodyPartLayers';
import {ActionId} from './enum/actions/ActionId';
import {AvatarEffectManager} from './effects/AvatarEffectManager';
import {AvatarEffectRenderer} from './effects/AvatarEffectRenderer';

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

/**
 * The zIndex of the hand item in the avatar container (see Avatar.assemble): over the shadow (-1) and under the
 * body (0) when the avatar turns its back, else over every part (the face accessories are 9).
 */
const HAND_ITEM_BEHIND_Z = -0.5;
const HAND_ITEM_FRONT_Z = 10;
/** The arm on the far side of the body: under the body (0), over the shadow (-1) and under what it holds (-0.5). */
const ARM_BEHIND_Z = -0.6;

export class AvatarImager {
    private data: AvatarImageData;
    private structure: AvatarStructure;
    private loaded = false;
    private parts: any;
    private textures: Repository<string, PIXI.Texture>;

    private spritePool: PIXI.Sprite[] = [];

    /** If a hand item has the sprites of an action (see hasHandItemSprites): looked up once. */
    private readonly handItemSprites = new Map<string, boolean>();

    /** The avatar effects (:effect): loaded once, drawn with the avatars that have them. */
    readonly effects: AvatarEffectManager;
    private readonly effectRenderer: AvatarEffectRenderer;

    constructor(structure: AvatarStructure) {
        this.data = new AvatarImageData();
        this.textures = new Repository();
        this.structure = structure;

        this.effects = new AvatarEffectManager(this.data.AvatarDownloadManager);
        this.effectRenderer = new AvatarEffectRenderer(
            // the axis of the mirrored figure parts (see drawSpriteComponent)
            () => (this.structure.Geometry?.width ?? 0) + AvatarData.AVATAR_LEFT_OFFSET,
            action => {
                const actionId = BodyPartLayers.actionByName(action);
                return (actionId && this.structure.Actions?.getActionById(actionId)?.assetPartDefiniton) || 'std';
            }
        );
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
            // a part unknown to the figure data: the others are loaded anyway
            if (!figurePart) continue;

            const assets: Set<string> = this.getAssets(figurePart.parts);

            await Promise.all(Array.from(assets, asset => this.data.loadPart(asset)));
        }

        if (avatar.Actions.has(ActionId.SIGN)) {
            const signAsset = this.structure.Assets?.getUniqueName('li', avatar.SignValue);
            if (signAsset) await this.data.loadPart(signAsset);
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

        // an effect can turn the avatar (e.g. sideways on the hoverboard)
        const effect = avatar.Effect;
        avatar.setDirectionOffset(effect?.animation.directionOffset ?? 0);

        this.structure.setGeometry(this.data.avatarGeometry?.geometry!);
        if (avatar.Actions.has(ActionId.SIGN)) {
            const signAsset = this.structure.Assets?.getUniqueName('li', avatar.SignValue);
            if (signAsset && !this.data.SpriteSheets.has(signAsset)) {
                await this.data.loadPart(signAsset);
            }
        }
        const actions = this.structure.Actions?.getActionsByIds(avatar.Actions) ?? [];
        const handItem = await this.getHandItem(avatar, actions);

        const figureComponents = avatar.AvatarFigure.getAllComponents();
        // the parts hidden by the clothes and the ones removed by the effect (e.g. the shoes in a car)
        const hiddens = [...avatar.AvatarFigure.getAllHidden(), ...(effect?.animation.removes ?? [])];
        hiddens.push(...this.getHairHiddenTypes(figureComponents, hiddens));

        if (avatar.Actions.has(ActionId.SIGN)) {
            figureComponents.push(new AvatarFigureComponent({
                type: 'li',
                id: avatar.SignValue,
                index: 0,
                colorable: false,
                colorindex: 0,
            }, ''));
        }

        if (handItem) {
            // first: the imager gives each part the first action that has it, the hand is the item's one
            // (Nitro sorts by precedence: CarryItem 205 before Move 600 and Default 1000)
            actions.unshift(handItem.action);
            figureComponents.push(new AvatarFigureComponent({
                type: 'ri',
                id: handItem.partId,
                index: 0,
                colorable: false,
                colorindex: 0,
            }, ''));
        }

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
            
            if(component.part.type != 'sd' && component.part.type != 'li' && component.part.type != 'ri') 
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

        if (effect) {
            this.effectRenderer.draw(avatar, effect);
            avatar.TotalFrames = Math.max(avatar.Frames, effect.frameCount);
        }

        avatar.assemble();
    }

    /**
     * What the avatar carries (Nitro's CARRY_OBJECT / USE_OBJECT): the action of the right hand, CarryItem ("crr")
     * or UseItem ("drk") while it drinks, and the "ri" part of hh_human_item drawn in the hand (the parameter of
     * the action, e.g. the coffees 11, 12 and 13 are the cup 6). Null without hand item, or when the actions
     * prevent it (HabboAvatarActions: e.g. Lay and Dance prevent "cri" and "usei").
     */
    private async getHandItem(avatar: Avatar, actions: Action[]): Promise<{action: Action; partId: number} | null> {
        if (!avatar.HandItem || avatar.isUI) return null;

        const prevented = (action: Action) => actions.some(other => other.prevents?.includes(action.state));

        const carry = this.structure.Actions?.getActionById(ActionId.CARRY_ITEM);
        if (!carry || prevented(carry)) return null;

        const item = String(avatar.HandItem);
        let action = carry;
        let partId = parseInt(carry.getParameterValue(item), 10);

        if (avatar.UsingHandItem) {
            const use = this.structure.Actions?.getActionById(ActionId.USE_ITEM);
            const useId = use ? parseInt(use.getParameterValue(item), 10) : NaN;

            // an item without the drinking sprites stays in the hand
            if (use && !prevented(use) && Number.isFinite(useId) && await this.hasHandItemSprites(use, useId)) {
                action = use;
                partId = useId;
            }
        }

        if (!Number.isFinite(partId) || !await this.hasHandItemSprites(action, partId)) return null;

        return {action, partId};
    }

    /** True if the library of the "ri" part has its sprites for the action (e.g. h_drk_ri_6_2_0). */
    private async hasHandItemSprites(action: Action, partId: number): Promise<boolean> {
        const assetName = this.structure.Assets?.getUniqueName('ri', partId);
        if (!assetName) return false;

        const key = `${assetName}/${action.assetPartDefiniton}/${partId}`;
        let has = this.handItemSprites.get(key);

        if (has === undefined) {
            await this.data.loadPart(assetName);

            const spritesheet = this.data.SpriteSheets.get(assetName);
            const prefix = `h_${action.assetPartDefiniton}_ri_${partId}_`;
            has = !!spritesheet && Object.keys(spritesheet).some(name => name.startsWith(prefix));
            this.handItemSprites.set(key, has);
        }

        return has;
    }

    /**
     * The two layers of a hair (as Habbo): "hrb" is the whole hair, "hr" the hair cut for a hat. HabboAvatarPartSets
     * says hrb removes hr: the whole hair is drawn, unless something hides it (the hiddenLayers of a hat, e.g. a beanie
     * hides hrb) and then the cut one is drawn under the hat. A hair without hrb sprites keeps hr.
     */
    private getHairHiddenTypes(components: AvatarFigureComponent[], hiddens: string[]): string[] {
        if (hiddens.includes('hrb')) return [];

        const hasWholeHair = components.some(component => {
            if (component.part.type !== 'hrb') return false;

            const assetName = this.structure.Assets?.getUniqueName('hrb', component.part.id);
            const spritesheet = assetName ? this.data.SpriteSheets.get(assetName) : null;
            const prefix = `h_std_hrb_${component.part.id}_`;

            return !!spritesheet && Object.keys(spritesheet).some(key => key.startsWith(prefix));
        });

        return hasWholeHair ? ['hr'] : [];
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
        const dancePart = action.id === ActionId.DANCE
            ? getDanceBodyPart(avatar.DanceStyle, avatar.BodyFrame, component.part.type)
            : null;
        // the dance moves the body parts, else the effect can (e.g. sitting in a car, arms on the wheel)
        const layerPart = dancePart
            ?? avatar.Effect?.animation.getBodyPartLayer(avatar.BodyFrame, component.part.type)
            ?? null;
        const layerAction = layerPart ? BodyPartLayers.actionOf(layerPart) : undefined;
        // a layer without action keeps the action of the avatar
        const selectedAction = layerPart?.action
            ? (layerAction && this.structure.Actions?.getActionById(layerAction))
                ?? this.structure.Actions?.getDefaultAction()
                ?? action
            : action;
        const animation = layerPart?.action === 'Default'
            ? undefined
            : this.structure.Animations?.getAnimation(layerPart?.action ?? action.id);
        const partFrames: IAnimationFrame[] =
            animation
                ?.getAnimationPart(component.part.type)
                ?.getFrames() ?? [];

        avatar.TotalFrames = Math.max(
            avatar.Frames,
            partFrames.length,
            dancePart ? getDanceFrameCount(avatar.DanceStyle) : 0,
            action.id === ActionId.LAUGH ? 16 : 0
        );

        const isHeadPart = this.structure.Geometry?.isHeadPart(component.part.type) ?? false;
        const baseDirection = isHeadPart ? avatar.HeadDirection : avatar.BodyDirection;
        // The local renderer has no joint pivot for turning a single atlas
        // part; applying Dance4's head direction delta here makes the head
        // jump to a different offset. Keep the head on its avatar direction.
        const direction = component.part.type == 'sd'
            ? 0
            : (baseDirection + (isHeadPart ? 0 : (layerPart?.dd ?? 0)) + 8) % 8;

        const frame = this.structure.Geometry?.isHeadPart(component.part.type)
            ? avatar.HeadFrame
            : avatar.BodyFrame;

        let partFrame: any = layerPart?.frame ??
            frame % (partFrames && Object.values(partFrames).length > 0 ? Object.values(partFrames).length : 1);
            
        const assetPartDefinition: string =
            partFrames && partFrames[partFrame]
                ? partFrames[partFrame].assetPartDefinition
                : selectedAction.assetPartDefiniton;

        const animationOffsets = animation?.getAnimationOffset(String(animation.id), partFrame, direction);
        const laughHeadMotion = action.id === ActionId.LAUGH && isHeadPart
            ? [0, 2, 4, 5, 3, 1, 0, 2, 5, 4, 2, 0, 1, 3, 2, 0][avatar.HeadFrame % 16]
            : 0;
        const laughHeadSway = action.id === ActionId.LAUGH && isHeadPart
            ? [0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 0, 0][avatar.HeadFrame % 16]
            : 0;
        const offsets = layerPart
            ? {
                dx: (animationOffsets?.dx ?? 0) + layerPart.dx,
                dy: (animationOffsets?.dy ?? 0) + layerPart.dy,
            }
            : action.id === ActionId.LAUGH && isHeadPart
                ? {
                    dx: (animationOffsets?.dx ?? 0) + laughHeadSway,
                    dy: (animationOffsets?.dy ?? 0) + laughHeadMotion,
                }
                : animationOffsets;

        partFrame =
            partFrames && partFrames[partFrame]
                ? partFrames[partFrame].number
                : 0;

        const flippedType = this.structure.PartSets?.getFlippedSetType(
            component.part.type
        );

        let spriteComponent = new AvatarSpriteComponent(
            assetPartDefinition,
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

        // Some clothes do not have every dance action/frame variant. Reuse
        // the standing sprite for that frame so a missing wlk/wave asset does
        // not make the shirt (or another figure part) disappear.
        const isFacialGesture = action.id === ActionId.BLOW || action.id === ActionId.LAUGH
            || action.id === ActionId.SMILE || action.id === ActionId.SAD
            || action.id === ActionId.ANGRY || action.id === ActionId.SURPRISED;
        if ((layerPart || isFacialGesture) && !spritesheet?.[spriteComponent.ResourceName]) {
            spriteComponent = new AvatarSpriteComponent(
                this.structure.Actions?.getDefaultAction()?.assetPartDefiniton ?? 'std',
                component.part.type,
                component.part.id.toString(),
                baseDirection,
                0,
                component.color,
                flippedType,
                avatar.IsSmall
            );
        }

        if (!spritesheet?.[spriteComponent.ResourceName]) return;
        
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
            // a linked asset only reuses the bitmap of another one: the offset is its own
            // (e.g. h_lay_sh_4_2_0 links h_sit_sh_4_2_0 but has a different offset)
            const ownOffset = asset.offset;
            if (asset.link != undefined) asset = { ...spritesheet[asset.link], offset: ownOffset ?? spritesheet[asset.link]?.offset };

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
            // a pooled sprite may have been a shadow or an effect sprite
            sprite.alpha = 1;
            sprite.blendMode = PIXI.BLEND_MODES.NORMAL;
            sprite.filters = null;
            sprite.zIndex = 0;

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

            // one container per part: without the else the shadow fell in the last branch too and
            // addChild moved it out of the ShadowContainer (it could not be hidden)
            if (component.ResourceType == 'sd') {
                sprite.alpha = 0.2;
                sprite.tint = 0x000000;
                avatar.ShadowContainer.addChild(sprite);
            }
            // the hand item: in front of the avatar, or behind its body when it turns its back (AvatarDrawOrder:
            // in the directions 0, 5, 6 and 7 "ri" comes before "bd", the body hides what it holds)
            else if (component.ResourceType == 'ri') {
                sprite.zIndex = this.isDrawnBehindBody('ri', component.Direction)
                    ? HAND_ITEM_BEHIND_Z
                    : HAND_ITEM_FRONT_Z;
                avatar.Container.addChild(sprite);
            }
            else if (component.ResourceType == 'sh')
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
                component.ResourceType == 'ha' ||
                component.ResourceType == 'hbr'
            )
                avatar.HatContainer.addChild(sprite);
            else if (component.ResourceType == 'he')
                avatar.HeadAccessoryContainer.addChild(sprite);
            // the hair below the hat (hrb) goes with the hair, under the hat: in the hat container it covered it
            else if (component.ResourceType == 'hr' || component.ResourceType == 'hrb')
                avatar.HairContainer.addChild(sprite);
            else if (component.ResourceType == 'bd')
                avatar.BodyContainer.addChild(sprite);
            else if (
                component.ResourceType == 'rh' ||
                component.ResourceType == 'lh' ||
                component.ResourceType == 'ls' ||
                component.ResourceType == 'rs' ||
                // the sleeves of the coats
                component.ResourceType == 'lc' ||
                component.ResourceType == 'rc' ||
                component.ResourceType == 'li'
            ) {
                // the arm on the far side (AvatarDrawOrder: before "bd") is behind the body: in the arms
                // container, over the torso, it showed over the shirt and the chest accessories
                if (this.isArmBehindBody(component)) {
                    sprite.zIndex = ARM_BEHIND_Z;
                    avatar.Container.addChild(sprite);
                } else {
                    avatar.ArmsContainer.addChild(sprite);
                }
            }
            // the torso and what goes on it (AvatarDrawOrder: ch, cc, cp, wa, ca, then the arm in front):
            // coat, print, belt and scarf were drawn in the main container, under the shirt and the arms
            else if (
                component.ResourceType == 'ch' ||
                component.ResourceType == 'cc' ||
                component.ResourceType == 'cp' ||
                component.ResourceType == 'wa' ||
                component.ResourceType == 'ca'
            )
                avatar.TorsoContainer.addChild(sprite);
            else avatar.Container.addChild(sprite);
        } else {
            if (Engine.getInstance().config.debug) {
                /*Logger.debug(
                    'Cannot find resource ' +
                        this.getTextureId(component.ResourceName)
                );*/
            }
        }
    }

    private getTextureId(resourceName: string) {
        return resourceName + '.png';
    }

    /**
     * True if the arm part is on the far side of the body. A mirrored part (directions 4, 5, 6 drawn from 2, 1, 0)
     * is on the other side: its left arm is the right one of the draw order (Nitro's flipped set types).
     */
    private isArmBehindBody(component: AvatarSpriteComponent): boolean {
        let type = component.ResourceType;
        if (component.IsFlipped && type !== 'li') {
            type = type.startsWith('l') ? 'r' + type.slice(1) : type.startsWith('r') ? 'l' + type.slice(1) : type;
        }

        return this.isDrawnBehindBody(type, component.Direction);
    }

    /** True if the part comes before the body in the standing draw order of the direction (AvatarDrawOrder). */
    private isDrawnBehindBody(partType: string, direction: Direction): boolean {
        const parts = this.getDrawParts('std', direction);
        if (!parts) return false;

        const index = parts.indexOf(partType);
        const body = parts.indexOf('bd');

        return index >= 0 && body >= 0 && index < body;
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
