<template>
    <Dialog title="Wardrobe" class-name="changelookUI" :box="UIEventsType.CHANGE_LOOK">
        <div class="wardrobe">
            <div class="wardrobeEditor">
                <!-- the categories -->
                <div class="wardrobeTabs">
                    <div class="wardrobeTab" v-for="tab in avatarTabs" :key="tab.id"
                        :class="{ active: currentTab == tab.id }" :title="tab.label" @click="changeTab(tab.id)">
                        <img :src="lookEditorImage(tab.icon)" alt="" />
                    </div>
                </div>

                <!-- the parts of the category (the gender for the body) -->
                <div class="wardrobeSubTabs">
                    <template v-if="currentTab == 'faceAndBody'">
                        <div class="wardrobeTab" :class="{ active: gender == 'M' }" title="Boy" @click="setGender('M')">
                            <img src="@/assets/images/look_editor/gender_male.png" alt="" />
                        </div>
                        <div class="wardrobeTab" :class="{ active: gender == 'F' }" title="Girl" @click="setGender('F')">
                            <img src="@/assets/images/look_editor/gender_female.png" alt="" />
                        </div>
                    </template>
                    <template v-else>
                        <div class="wardrobeTab" v-for="(tab, key) in currentMainTab?.tabs" :key="key"
                            :class="{ active: secondTabId == key }" @click="changeSecondTab(key)">
                            <img :src="lookEditorImage(tab.image)" alt="" />
                        </div>
                    </template>
                </div>

                <div class="wardrobeParts wardrobeScroll">
                    <div class="wardrobePart" v-for="part in partSet" :key="part.key"
                        :class="{ selected: part.selected, hc: part.isHc, loaded: part.loaded, remove: part.key == -1 }"
                        @click="handleChangePart(part)">
                        <img :src="part.img" alt="" />
                    </div>
                </div>

                <div class="wardrobePalettes">
                    <div class="wardrobePalette wardrobeScroll" v-for="palette in palettes" :key="palette.key">
                        <div class="wardrobeColor" v-for="color in palette.colors" :key="color.colorId"
                            :class="{ selected: color.selected, hc: color.isHc }"
                            :style="{ backgroundColor: '#' + color.backgroundColor }"
                            @click="handleChangeColor(color, palette)">
                        </div>
                    </div>
                </div>
            </div>

            <div class="wardrobePreview">
                <div class="wardrobeAvatar">
                    <img v-if="lookImage != ''" :src="lookImage" alt=""
                        :style="lookImageWidth ? { width: lookImageWidth + 'px' } : undefined" @load="onLookImageLoad" />
                </div>
                <div class="wardrobeRotate">
                    <svg class="wardrobeArrow" viewBox="0 0 48 30" @click="rotate(1)">
                        <path d="M45 9 Q26 1 12 13 L7 7 L4 26 L22 24 L16 18 Q27 10 45 17 Z" />
                    </svg>
                    <svg class="wardrobeArrow flipped" viewBox="0 0 48 30" @click="rotate(-1)">
                        <path d="M45 9 Q26 1 12 13 L7 7 L4 26 L22 24 L16 18 Q27 10 45 17 Z" />
                    </svg>
                </div>
                <button class="wardrobeSave" @click="saveLook">Save changes</button>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { Engine } from "../../../game/Engine"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import Dialog from '../dialog/Dialog.vue'
import avatarLoadingImage from '../../../assets/images/loading.png'
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType";
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { AvatarFigure } from '../../../game/engine/ui/imagers/avatars/AvatarFigure'
import { AvatarHeadImage } from '../../../game/engine/ui/imagers/avatars/AvatarHeadImage'
import { ChangeLookEventData } from '../../../game/engine/events/ui/data/avatar/ChangeLookEventData'
import { EventManager } from '../../../game/core/events/EventManager'

const avatarTabs = [
    {
        id: "faceAndBody",
        label: "Body",
        icon: "tab_body",
        tabs: [{
            type: "hd",
            image: "avatar_editor_download_icon",
            required: true,
        }]
    },
    {
        id: "head",
        label: "Head",
        icon: "head_hats",
        tabs: [
            { type: "hr", image: "head_hair", required: false },
            { type: "ha", image: "head_hats", required: false },
            { type: "he", image: "head_accessories", required: false },
            { type: "ea", image: "head_eyewear", required: false },
            { type: "fa", image: "head_face_accessories", required: false }
        ]
    },
    {
        id: "torso",
        label: "Torso",
        icon: "top_shirt",
        tabs: [
            { type: "ch", image: "top_shirt", required: true },
            { type: "cc", image: "top_jacket", required: false },
            { type: "ca", image: "top_accessories", required: false },
            { type: "cp", image: "top_prints", required: false }
        ]
    },
    {
        id: "legs",
        label: "Legs",
        icon: "bottom_trousers",
        tabs: [
            { type: "lg", image: "bottom_trousers", required: true },
            { type: "sh", image: "bottom_shoes", required: false },
            { type: "wa", image: "bottom_accessories", required: false }
        ]
    }
]

/** The thumbnails drawn at the same time: the downloads of the libraries go in parallel. */
const THUMBNAIL_CONCURRENCY = 4

const currentTab = ref<string>('faceAndBody')
const secondTabId = ref<number>(0)
const gender = ref<string>('M')
const look = ref<string>('hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61');
const partSet = ref<any[]>([])
const lookImage = ref<string>('')
const palettes = ref<any[]>([])
/** The preview is drawn bigger: a whole zoom keeps the pixels sharp (there are no bigger avatar assets). */
const PREVIEW_ZOOM = 2
const lookImageWidth = ref<number>(0)

function onLookImageLoad(event: Event) {
    lookImageWidth.value = (event.target as HTMLImageElement).naturalWidth * PREVIEW_ZOOM
}

/** Where the avatar of the preview looks (0-7). */
const direction = ref<number>(2)

const currentMainTab = computed(() => avatarTabs.find(e => e.id === currentTab.value))
const currentSubTab = computed(() => currentMainTab.value?.tabs[secondTabId.value])

// the preview follows the look; the thumbnails depend only on the tab, the gender and the colors
watch([look, direction], () => generateLookPreview());

EventManager.read(UIEvents.CHANGE_LOOK, (evt: ChangeLookEventData) => {
    // a look saved before (e.g. with the colors "NaN" or a part written twice) is repaired
    look.value = normalizeLook(evt.look)
    if (evt.gender) gender.value = evt.gender.toUpperCase().startsWith('F') ? 'F' : 'M'

    // the selected parts and colors of the open tab follow the loaded look
    setUpLookComponents()
})

// the current look of the user: the server answers with UpdateUserInformation (-> CHANGE_LOOK)
Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.UserProfileInformation)

/*
 * The thumbnails: drawn a few at a time, in the order of the grid. A new part set (another tab, gender or color)
 * drops the ones still waiting; the images are cached by figure (AvatarHeadImage), so a tab opened again is instant.
 */
let thumbnailGeneration = 0
let thumbnailQueue: Array<() => Promise<void>> = []
let thumbnailsRunning = 0

function pumpThumbnails() {
    while (thumbnailsRunning < THUMBNAIL_CONCURRENCY && thumbnailQueue.length > 0) {
        const task = thumbnailQueue.shift()!
        thumbnailsRunning++
        task().catch(() => {}).finally(() => {
            thumbnailsRunning--
            pumpThumbnails()
        })
    }
}

function avatarImage(figure: string, headOnly: boolean): Promise<string> {
    return headOnly ? AvatarHeadImage.get(figure) : AvatarHeadImage.full(figure)
}

function hide() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.ChangeLookUI)?.hide()
}

function lookEditorImage(image: string) {
    return new URL(`../../../assets/images/look_editor/${image}.png`, import.meta.url).href
}

function changeTab(tab: string) {
    currentTab.value = tab
    secondTabId.value = 0
    setUpLookComponents()
}

function changeSecondTab(key: number) {
    secondTabId.value = key
    setUpLookComponents()
}

function setGender(newGender: string) {
    if (gender.value === newGender) return
    gender.value = newGender
    setUpLookComponents()
}

function setUpLookComponents() {
    generatePartSet()
    generatePalettes()
}

/** The part of the look of the open tab (e.g. the hair), if the look has one. */
function calculateCurrentPart() {
    const avatarTab = currentSubTab.value
    if (!avatarTab) return undefined

    return new AvatarFigure(look.value).parts.find((value: any) => value.type === avatarTab.type)
}

function calculateCurrentColor(colorId: number) {
    return calculateCurrentPart()?.colors[colorId] || 0
}

/** The preview of the whole look; an older one finishing late does not replace a newer one. */
let previewGeneration = 0

function generateLookPreview() {
    const generation = ++previewGeneration
    const figure = look.value

    AvatarHeadImage.full(figure, direction.value).then(dataUrl => {
        if (generation === previewGeneration) lookImage.value = dataUrl
    })
}

function generatePartSet() {
    const generation = ++thumbnailGeneration
    thumbnailQueue = []

    const avatarMainTab = currentMainTab.value
    const avatarTab = currentSubTab.value
    if (!avatarMainTab || !avatarTab) {
        partSet.value = []
        return
    }

    const figureData = Engine.getInstance()?.userInterfaceManager?.avatarImager?.Structure?.AvatarFigureData
    const currentPartSets = figureData?.getSetByType(avatarTab.type)?.partSets
    const currentPart = calculateCurrentPart()

    let currentColor = calculateCurrentColor(0).toString()
    if (currentPart != null && currentPart.colors.length > 1) {
        currentColor += "-" + calculateCurrentColor(1)
    }

    const parts: any[] = []

    if (!avatarTab.required) {
        parts.push({
            type: avatarTab.type,
            key: -1,
            img: new URL("../../../assets/images/look_editor/removeSelection.png", import.meta.url).href,
            isHc: false,
            selected: currentPart == null,
            loaded: true
        })
    }

    currentPartSets?.forEach((part: any, partId: string) => {
        if ((part.gender !== gender.value && part.gender !== 'U') || !part.selectable) return

        parts.push({
            type: avatarTab.type,
            key: partId,
            img: avatarLoadingImage,
            isHc: part.club && part.club > 0,
            loaded: false,
            figure: avatarTab.type + "-" + partId + "-" + currentColor,
            selected: currentPart != null && currentPart.id === partId.toString(),
        })
    })

    partSet.value = parts

    // the reactive items (partSet.value), so the images set later are shown
    const headOnly = avatarMainTab.id === 'faceAndBody'
    for (const part of partSet.value) {
        if (part.loaded) continue

        thumbnailQueue.push(async () => {
            if (generation !== thumbnailGeneration) return

            const dataUrl = await avatarImage(part.figure, headOnly)
            if (generation !== thumbnailGeneration) return

            if (dataUrl) part.img = dataUrl
            part.loaded = true
        })
    }

    pumpThumbnails()
}

function handleChangePart(part: any) {
    const avatarFigure = new AvatarFigure(look.value)

    if (part.key == -1) {
        look.value = generateFigureString(avatarFigure.look.filter((p: any) => p.type !== part.type))
    } else {
        // with the color of its thumbnail: a part without colors was saved as "ha-3766-NaN"
        const newPart = new AvatarFigure(part.figure).look[0]

        const currentPart = avatarFigure.look.find((p: any) => p.type === part.type)
        if (currentPart) newPart.colors = currentPart.colors

        const otherParts = avatarFigure.look.filter((p: any) => p.type !== part.type)
        look.value = generateFigureString([...otherParts, newPart])
    }

    partSet.value.forEach(e => e.selected = false)
    part.selected = true

    // the thumbnails stay (same tab and colors); the palettes follow the colors of the new part
    generatePalettes()
}

function generatePalette(paletteId: number) {
    const avatarTab = currentSubTab.value
    if (!avatarTab) return []

    const figureData = Engine.getInstance()?.userInterfaceManager?.avatarImager?.Structure?.AvatarFigureData

    const setType = figureData?.getSetByType(avatarTab.type)
    if (!setType) return []

    const palette = figureData?.getPalette(setType.paletteid.toString())
    if (!palette) return []

    const colors: any[] = []
    const currentColor = calculateCurrentColor(paletteId)

    palette.colors.forEach((colorData: any, colorIdStr: string) => {
        if (!colorData.selectable) return

        const colorId = parseInt(colorIdStr)
        colors.push({
            isHc: colorData.club > 0,
            selected: colorId === parseInt(currentColor),
            paletteId: paletteId,
            colorId: colorId,
            backgroundColor: colorData.color
        })
    })

    return colors
}

function generatePalettes() {
    const currentPart = calculateCurrentPart()
    const colorCount = currentPart ? Math.max(1, currentPart.colors.length) : 1

    const result: any[] = []
    for (let i = 0; i < colorCount; i++) {
        result.push({ key: i, colors: generatePalette(i) })
    }
    palettes.value = result
}

function generateFigureString(parts: any[]): string {
    return normalizeLook(parts.map(part => {
        let str = `${part.type}-${part.id}`
        if (part.colors && part.colors.length > 0) {
            str += `-${part.colors.join('-')}`
        }
        return str
    }).join('.'))
}

/**
 * A look with one part per type (the last one written stays, e.g. a color changed) and only numeric colors:
 * a colorable part without a valid color gets the first selectable color of its palette.
 */
function normalizeLook(figure: string): string {
    const parts = new Map<string, string>()

    for (const raw of (figure ?? '').split('.')) {
        const [type, id, ...colors] = raw.split('-')
        if (!type || !id || isNaN(Number(id))) continue

        const validColors = colors.filter(color => color !== '' && !isNaN(Number(color)))
        if (validColors.length === 0) {
            const color = defaultColor(type, id)
            if (color) validColors.push(color)
        }

        // the order of the look follows the last write of each type
        parts.delete(type)
        parts.set(type, [type, id, ...validColors].join('-'))
    }

    return [...parts.values()].join('.')
}

/** The first selectable color of the palette of a set, if the set is colorable. */
function defaultColor(type: string, setId: string): string | null {
    const figureData = Engine.getInstance()?.userInterfaceManager?.avatarImager?.Structure?.AvatarFigureData
    const setType = figureData?.getSetByType(type)
    const partSet = setType?.partSets?.get(setId)
    if (!setType || !partSet?.colorable) return null

    const palette = figureData?.getPalette(setType.paletteid.toString())
    for (const [colorId, color] of palette?.colors ?? []) {
        if ((color as any).selectable) return String(colorId)
    }
    return null
}

function handleChangeColor(color: any, palette: any) {
    const currentPart = calculateCurrentPart()
    if (currentPart == null) return

    currentPart.colors[palette.key] = color.colorId.toString()
    look.value = generateFigureString(
        new AvatarFigure(look.value + "." + generateFigureString([currentPart])).look
    )

    palette.colors.forEach((e: any) => e.selected = false)
    color.selected = true

    // the thumbnails are drawn with the color of the part
    generatePartSet()
}

/** Turns the avatar of the preview (+1 clockwise, -1 the other way). */
function rotate(step: number) {
    direction.value = (direction.value + step + 8) % 8
}

function saveLook() {
    Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.UserChangeLookEvent, {
        look: look.value,
        gender: gender.value
    })
    hide()
}

onMounted(() => {
    currentTab.value = 'faceAndBody'
    secondTabId.value = 0
    setUpLookComponents()
    generateLookPreview()
})
</script>

<style lang="scss">
/* the root of the Dialog: in the middle of the screen, never larger than it (the bottom bar is 54px) */
#dialog.changelookUI {
    position: fixed;
    top: max(8px, calc(50vh - 290px));
    left: max(8px, calc(50vw - 340px));
    /* on whole pixels: half a pixel blurs the pixel art */
    top: unquote("max(8px, round(down, calc(50vh - 290px), 1px))");
    left: unquote("max(8px, round(down, calc(50vw - 340px), 1px))");
    width: min(680px, calc(100vw - 16px));
    height: min(560px, calc(100vh - 70px));
    box-sizing: border-box;

    > .content {
        padding: 10px 12px;
        box-sizing: border-box;
    }
}

.wardrobe {
    height: 100%;
    display: flex;
    gap: 14px;
    font-family: "Ubuntu", sans-serif;
    user-select: none;

    // ---------------- the scrollbars, as Habbo's (grey track, round thumb, arrows)
    .wardrobeScroll {
        overflow-y: auto;
        overflow-x: hidden;

        &::-webkit-scrollbar {
            width: 15px;
        }

        &::-webkit-scrollbar-track {
            background: #e3e3dc;
            border: 1px solid #000;
            border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb {
            border: 1px solid #000;
            border-radius: 4px;
            background:
                repeating-linear-gradient(#e9e9e1 0 2px, #8f8f8a 2px 3px) center / 7px 11px no-repeat,
                linear-gradient(90deg, #f4f4ef, #c9c9c1);
        }

        &::-webkit-scrollbar-button:single-button {
            display: block;
            height: 13px;
            background-color: #e9e9e1;
            border: 1px solid #000;
            border-radius: 2px;
            background-repeat: no-repeat;
            background-position: center;
            background-size: 7px 5px;
        }

        &::-webkit-scrollbar-button:single-button:vertical:decrement {
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 5'><path d='M0 5 L3.5 0 L7 5 Z' fill='black'/></svg>");
        }

        &::-webkit-scrollbar-button:single-button:vertical:increment {
            background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7 5'><path d='M0 0 L3.5 5 L7 0 Z' fill='black'/></svg>");
        }
    }

    // ---------------- left: categories, parts and colors
    .wardrobeEditor {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .wardrobeTabs,
    .wardrobeSubTabs {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
    }

    .wardrobeTab {
        flex: 0 0 auto;
        height: 42px;
        min-width: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 6px;

        img {
            image-rendering: pixelated;
            pointer-events: none;
            filter: grayscale(1);
            opacity: 0.55;
            transition: filter 0.1s, opacity 0.1s;
        }

        &:hover img {
            opacity: 0.85;
        }

        &.active {
            background: rgba(0, 0, 0, 0.06);

            img {
                filter: none;
                opacity: 1;
            }
        }
    }

    // the categories stay colored, the parts of the category are grey until chosen
    .wardrobeTabs .wardrobeTab img {
        filter: none;
    }

    .wardrobeParts {
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, 58px);
        grid-auto-rows: 58px;
        justify-content: space-between;
        align-content: start;
        gap: 8px;
        padding: 2px 8px 2px 2px;
    }

    .wardrobePart {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: radial-gradient(circle at 50% 60%, #d9d9d4 0 58%, #cdcdc6 59%);
        cursor: pointer;
        overflow: hidden;

        img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            pointer-events: none;
        }

        &:hover {
            background: radial-gradient(circle at 50% 60%, #e6e6e1 0 58%, #d8d8d1 59%);
        }

        &.selected {
            background: radial-gradient(circle at 50% 60%, #eef2f4 0 58%, #dde4e8 59%);
            box-shadow: inset 0 0 0 2px #4c8fbd, inset 0 0 0 4px #b9d6ea;
        }
    }

    .wardrobePalettes {
        flex: 0 0 96px;
        display: flex;
        gap: 10px;
        border-top: 1px solid #c9c9c1;
        padding-top: 6px;
    }

    .wardrobePalette {
        flex: 1;
        min-width: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, 24px);
        grid-auto-rows: 24px;
        justify-content: space-between;
        align-content: start;
        gap: 4px;
        padding: 1px 6px 1px 1px;
    }

    .wardrobeColor {
        position: relative;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.18), inset 0 0 0 1px rgba(0, 0, 0, 0.25);

        &:hover {
            filter: brightness(1.1);
        }

        &.selected {
            box-shadow: 0 0 0 2px #fff, 0 0 0 3px #4c8fbd;

            &::after {
                content: "";
                position: absolute;
                top: 4px;
                left: 6px;
                width: 8px;
                height: 4px;
                border-radius: 4px;
                background: rgba(255, 255, 255, 0.6);
            }
        }
    }

    // ---------------- right: the avatar
    .wardrobePreview {
        flex: 0 0 170px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding-top: 10px;
    }

    .wardrobeAvatar {
        flex: 1 1 auto;
        min-height: 0;
        width: 100%;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        position: relative;

        // the floor under the avatar
        &::before {
            content: "";
            position: absolute;
            bottom: -6px;
            width: 110px;
            height: 26px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.08);
        }

        img {
            position: relative;
            flex: 0 0 auto;
            image-rendering: pixelated;
        }
    }

    .wardrobeRotate {
        flex: 0 0 auto;
        display: flex;
        gap: 18px;
        margin-top: 10px;
    }

    .wardrobeArrow {
        width: 44px;
        height: 28px;
        cursor: pointer;

        path {
            fill: #4a9bd1;
            stroke: #1d5f8a;
            stroke-width: 1.5;
            stroke-linejoin: round;
        }

        &.flipped {
            transform: scaleX(-1);
        }

        &:hover path {
            fill: #63b2e4;
        }

        &:active {
            translate: 0 1px;
        }
    }

    .wardrobeSave {
        flex: 0 0 auto;
        margin-bottom: 4px;
        padding: 5px 12px;
        background: linear-gradient(#fff, #e9e9e4);
        border: 2px solid #000;
        border-radius: 6px;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        color: #000;
        cursor: pointer;
        outline: none;
        box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);

        &:hover {
            background: linear-gradient(#fff, #f3f3ef);
        }

        &:active {
            translate: 0 1px;
        }
    }
}

/* phone: the avatar goes under the editor, the dialog scrolls */
@media (max-width: 540px) {
    #dialog.changelookUI {
        top: 8px;
        height: calc(100vh - 70px);
    }

    .wardrobe {
        flex-direction: column;
        overflow-y: auto;

        .wardrobeEditor {
            flex: 0 0 auto;
        }

        .wardrobeParts {
            flex: 0 0 220px;
        }

        .wardrobeTabs,
        .wardrobeSubTabs {
            padding: 0;
            overflow-x: auto;
        }

        .wardrobePreview {
            flex: 0 0 260px;
        }
    }
}
</style>
