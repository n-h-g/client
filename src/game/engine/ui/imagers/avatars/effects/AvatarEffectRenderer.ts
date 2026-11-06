import {BLEND_MODES, Filter, Sprite} from 'pixi.js';
import {Avatar} from '../Avatar';
import {ActionId} from '../enum/actions/ActionId';
import {AvatarData} from '../enum/AvatarData';
import {AvatarEffect} from './AvatarEffect';
import {AvatarEffectAsset} from './AvatarEffectAssets';
import {AvatarEffectAdd, AvatarEffectSprite} from './AvatarEffectAnimation';

/** The ink of the sprites drawn with additive blending (Nitro's AvatarVisualization). */
const INK_ADD = 33;

/**
 * Where the effect bitmaps go among the part containers of the avatar
 * (shadow -1, body 0, legs 1, torso 2, arms 3, head 4 ... head accessories 9, see Avatar.assemble).
 */
const Z_INDEX = {
    /** The adds aligned to a geometry body part. */
    behind: -0.6,
    bottom: -0.5,
    rightitem: 3.5,
    leftitem: 3.5,
    top: 10,
    /** The sprites under (dz < 0) or over the avatar. */
    spriteUnder: -0.4,
    spriteOver: 20,
};

/** Resolves the asset part of an action named by a layer ("Sit" -> "sit"), "std" if none. */
export type AssetPartResolver = (action?: string) => string;

/**
 * Draws an effect on an avatar already drawn (AvatarImager.drawAvatar), as Nitro does:
 * - the sprites of the animation (AvatarVisualization: member_direction_frame, dx/dy/dz by direction, ink);
 * - the parts added to the body parts (AvatarStructure.getParts: <action>_<add>_<id>_<direction>_<frame>);
 * - the colors of the avatar (AvatarDataContainer).
 * The figure parts removed by the effect and its body part layers are applied by the imager while drawing.
 */
export class AvatarEffectRenderer {
    constructor(
        /** The x the figure parts are mirrored around (the flipped directions 4, 5, 6). */
        private readonly flipAxisX: () => number,
        private readonly resolveAssetPart: AssetPartResolver
    ) {}

    draw(avatar: Avatar, effect: AvatarEffect): void {
        const colorFilter = effect.animation.color?.createFilter() ?? null;
        const avatarOffset = this.getAvatarOffset(avatar, effect);

        for (const sprite of effect.animation.sprites) {
            if (!sprite.isAvatar) this.drawSprite(avatar, effect, sprite);
        }

        for (const add of effect.animation.adds) {
            this.drawAdd(avatar, effect, add, colorFilter, avatarOffset);
        }

        // the figure is moved and colored; the shadow and the sprites of the effect are not
        for (const container of avatar.PartContainers) {
            container.position.set(avatarOffset.x, avatarOffset.y);
            if (colorFilter) container.filters = [colorFilter];
        }
    }

    /**
     * As Nitro's "avatar" sprite: the offset of the whole avatar (by direction and frame), not applied
     * to an avatar sitting or laying (Nitro: only when it can't stand up from a furni).
     */
    private getAvatarOffset(avatar: Avatar, effect: AvatarEffect): {x: number; y: number} {
        const data = effect.animation.avatarSprite;
        if (!data || avatar.Actions.has(ActionId.SIT) || avatar.Actions.has(ActionId.LAY)) return {x: 0, y: 0};

        const direction = avatar.BodyDirection;
        const layer = effect.animation.getFxLayer(avatar.BodyFrame, data.id);

        return {
            x: data.getDirectionOffsetX(direction) + (layer?.dx ?? 0),
            y: data.getDirectionOffsetY(direction) + (layer?.dy ?? 0),
        };
    }

    private drawSprite(avatar: Avatar, effect: AvatarEffect, data: AvatarEffectSprite): void {
        const direction = avatar.BodyDirection;
        const layer = effect.animation.getFxLayer(avatar.BodyFrame, data.id);

        const frame = layer?.frame ?? 0;
        const dx = data.getDirectionOffsetX(direction) + (layer?.dx ?? 0);
        let dy = data.getDirectionOffsetY(direction) + (layer?.dy ?? 0);
        const assetDirection = AvatarEffectRenderer.wrap((data.hasDirections ? direction : 0) + (layer?.dd ?? 0));

        const asset = effect.assets.getAsset(`h_${data.member}_${assetDirection}_${frame}`);
        if (!asset) return;

        // a static sprite stays on the floor when the avatar (its container) is drawn lower to sit
        if (data.hasStaticY && avatar.Actions.has(ActionId.SIT)) dy -= AvatarData.AVATAR_SIT_OFFSET;

        const sprite = this.createSprite(asset, asset.flipH, dx, dy);
        sprite.zIndex = data.getDirectionOffsetZ(direction) < 0 ? Z_INDEX.spriteUnder : Z_INDEX.spriteOver;
        if (data.ink === INK_ADD) sprite.blendMode = BLEND_MODES.ADD;

        avatar.Container.addChild(sprite);
    }

    private drawAdd(
        avatar: Avatar,
        effect: AvatarEffect,
        add: AvatarEffectAdd,
        colorFilter: Filter | null,
        avatarOffset: {x: number; y: number}
    ): void {
        const layer = effect.animation.getFxLayer(avatar.BodyFrame, add.id);
        // the body part it's aligned to (e.g. "rightitem" carrying the totem: CarryItem)
        const alignLayer = effect.animation.getBodyPartLayerById(avatar.BodyFrame, add.align);
        const direction = AvatarEffectRenderer.wrap(avatar.BodyDirection + (layer?.dd ?? alignLayer?.dd ?? 0));
        const frame = layer?.frame ?? alignLayer?.frame ?? 0;
        // as Nitro: an add without base is the part 1 of its set, else the part named by its base
        // (or the part of the effect)
        const partIds = add.base === '' ? ['1'] : [add.base, String(effect.id)];
        const actions = [layer?.action, alignLayer?.action];

        const found = this.findAddAsset(effect, add, partIds, direction, frame, actions);
        if (!found) return;

        // the adds are parts of the avatar image: they move with it
        const sprite = this.createSprite(
            found.asset,
            found.asset.flipH !== found.mirrored,
            avatarOffset.x + (layer?.dx ?? 0),
            avatarOffset.y + (layer?.dy ?? 0)
        );
        sprite.zIndex = Z_INDEX[add.align as keyof typeof Z_INDEX] ?? Z_INDEX.top;
        if (add.ink === INK_ADD) sprite.blendMode = BLEND_MODES.ADD;
        // the adds are parts of the avatar: they get its colors
        if (colorFilter) sprite.filters = [colorFilter];

        avatar.Container.addChild(sprite);
    }

    /**
     * The asset of an add as Nitro's AvatarImageCache fallbacks: the frame of the action, its frame 0, the same
     * with the standing action. The flipped directions without their own bitmaps use the mirrored one.
     */
    private findAddAsset(
        effect: AvatarEffect,
        add: AvatarEffectAdd,
        partIds: string[],
        direction: number,
        frame: number,
        actions: (string | undefined)[]
    ): {asset: AvatarEffectAsset; mirrored: boolean} | null {
        const assetParts = [...new Set([...actions.filter(Boolean).map(action => this.resolveAssetPart(action)), 'std'])];
        const directions: [number, boolean][] = [[direction, false]];
        if (AvatarData.FLIPPED_DIRECTIONS[direction]) directions.push([6 - direction, true]);

        for (const [assetDirection, mirrored] of directions) {
            for (const partId of partIds) {
                for (const assetPart of assetParts) {
                    for (const partFrame of [frame, 0]) {
                        const name = `h_${assetPart}_${add.id}_${partId}_${assetDirection}_${partFrame}`;
                        const asset = effect.assets.getAsset(name);
                        if (asset) return {asset, mirrored};
                    }
                }
            }
        }

        return null;
    }

    /** A sprite placed as the figure parts: pivot on the registration point, mirrored as they are. */
    private createSprite(asset: AvatarEffectAsset, flipped: boolean, dx: number, dy: number): Sprite {
        const sprite = new Sprite(asset.texture);

        sprite.pivot.set(asset.x, asset.y);
        sprite.y = dy;

        if (flipped) {
            sprite.scale.x = -1;
            sprite.x = this.flipAxisX() + dx;
        } else {
            sprite.x = dx;
        }

        sprite.eventMode = 'dynamic';
        sprite.cursor = 'pointer';

        return sprite;
    }

    private static wrap(direction: number): number {
        return ((direction % 8) + 8) % 8;
    }
}
