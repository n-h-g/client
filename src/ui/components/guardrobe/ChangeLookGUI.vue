<template>
    <Dialog title="ChangeLook" class-name="changelookUI" :box="UIEventsType.CHANGE_LOOK">
        <div class="changeLookContainer">
            <div class="tabs">
                <div class="tab" :class="{ active: currentTab == 'faceAndBody' }" @click="changeTab('faceAndBody')">
                    Face and Body
                </div>
                <div class="tab" :class="{ active: currentTab == 'head' }" @click="changeTab('head')">
                    Head
                </div>
                <div class="tab" :class="{ active: currentTab == 'torso' }" @click="changeTab('torso')">
                    Torso
                </div>
                <div class="tab" :class="{ active: currentTab == 'legs' }" @click="changeTab('legs')">
                    Legs
                </div>
            </div>
            <div class="tabContainer">
                <div class="firstChoose" v-if="currentTab == 'faceAndBody'">
                    <div class="chooseTab" :class="{active: gender == 'M'}" @click="setGender('M')">
                        <img src="@/assets/images/look_editor/gender_male.png" />
                    </div>
                    <div class="chooseTab" :class="{active: gender == 'F'}" @click="setGender('F')">
                        <img src="@/assets/images/look_editor/gender_female.png" />
                    </div>
                </div>
                <div class="firstChoose" v-else>
                    <div class="chooseTab" v-for="(tab, key) in currentMainTab?.tabs" :key="key"
                        :class="{active: secondTabId == key}" @click="changeSecondTab(key)">
                        <img :src="getSecondTabImage(tab.image)" />
                    </div>
                </div>
                <div class="parts" :class="currentTab != 'faceAndBody' ? currentSubTab?.type : 'faceAndBody'">
                    <div class="part" v-for="part in partSet" :key="part.key"
                        :class="{selected: part.selected, hc: part.isHc, loaded: part.loaded}"
                        @click="handleChangePart(part)">
                        <img :src="part.img" />
                    </div>
                </div>
                <div class="lookPreview">
                    <div class="lookBackground">
                        <img v-if="lookImage != ''" :src='lookImage' />
                    </div>
                    <div class="buttonContainer">
                        <button class="saveButton" @click="saveLook">Salva</button>
                    </div>
                </div>
                <div class="palettesContainer">
                    <div class="palette" v-for="palette in palettes" :key="palette.key">
                        <div class="color" v-for="color in palette.colors" :key="color.colorId"
                            :class="{selected: color.selected, hc: color.isHc}"
                            :style="{backgroundColor: '#' + color.backgroundColor}"
                            @click="handleChangeColor(color, palette)">
                        </div>
                    </div>
                </div>
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
        tabs: [{
            type: "hd",
            image: "avatar_editor_download_icon",
            required: true,
        }]
    },
    {
        id: "head",
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
        tabs: [
            { type: "ch", image: "top_shirt", required: true },
            { type: "cc", image: "top_jacket", required: false },
            { type: "ca", image: "top_accessories", required: false },
            { type: "cp", image: "top_prints", required: false }
        ]
    },
    {
        id: "legs",
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

const currentMainTab = computed(() => avatarTabs.find(e => e.id === currentTab.value))
const currentSubTab = computed(() => currentMainTab.value?.tabs[secondTabId.value])

// the preview follows the look; the thumbnails depend only on the tab, the gender and the colors
watch(look, () => generateLookPreview());

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

function getSecondTabImage(image: string) {
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

    avatarImage(figure, false).then(dataUrl => {
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

<style lang="scss" scoped>

/* the root of the Dialog: in the middle of the screen, never larger than it (the bottom bar is 54px) */
.changelookUI {
    position: fixed;
    top: max(8px, calc(50vh - 250px));
    left: max(8px, calc(50vw - 380px));
    width: min(760px, calc(100vw - 16px));
    height: min(440px, calc(100vh - 70px));
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
}

.changeLookContainer {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: transparent;
    font-family: "Ubuntu", sans-serif;

    .tabs {
        flex: 0 0 auto;
        padding: 5px 16px 0;
        border-bottom: 1px solid #000;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 2px;

        .tab {
            text-align: center;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            border: 1px solid #000;
            border-bottom: 0;
            padding: 3px 6px;
            color: #000;
            background-color: #c3c2b8;
            position: relative;
            cursor: pointer;
            user-select: none;
            white-space: nowrap;

            &.active {
                border-left: 2px solid #000;
                border-right: 2px solid #000;
                border-top: 2px solid #000;
                background-color: #eceae0;

                &::after {
                    content: ' ';
                    position: absolute;
                    bottom: -1px;
                    width: 100%;
                    height: 2px;
                    background-color: #eceae0;
                    left: 0;
                }
            }
        }
    }

    /* the subtabs, the parts, the preview and the colors: side by side, stacked on a small screen */
    .tabContainer {
        flex: 1 1 auto;
        min-height: 0;
        display: grid;
        grid-template-columns: 70px minmax(0, 1fr) 150px auto;
        grid-template-rows: minmax(0, 1fr);
        grid-template-areas: "side parts preview colors";
        gap: 10px;
        padding: 5px 0;

        .firstChoose {
            grid-area: side;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 6px;
            overflow-y: auto;

            .chooseTab {
                flex: 0 0 auto;
                background-color: #cbd1d8;
                padding: 4px;
                width: 50px;
                height: 50px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                user-select: none;
                border-radius: 5px;
                box-shadow: inset 2px 2px 0 2px rgba(0, 0, 0, .25);
                box-sizing: border-box;

                img {
                    object-fit: none;
                }

                &.active {
                    background-color: #fff;
                    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, .4);
                }
            }
        }

        .parts {
            grid-area: parts;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
            grid-auto-rows: 50px;
            align-content: start;
            gap: 4px;
            overflow-y: auto;
            overflow-x: hidden;
            border-radius: 5px;
            min-height: 0;

            .part {
                background-color: #b3b5bc;
                display: flex;
                justify-content: center;
                align-items: center;
                border-radius: 5px;
                box-shadow: inset 2px 2px 0 2px rgba(0, 0, 0, .25);
                cursor: pointer;
                user-select: none;
                overflow: hidden;

                img {
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain;
                    image-rendering: pixelated;
                    pointer-events: none;
                }

                &.selected {
                    background-color: #fff;
                    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, .4);
                }
            }
        }

        .lookPreview {
            grid-area: preview;
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
            background-color: #c2ced4;
            border-radius: 5px;
            min-height: 0;
            box-sizing: border-box;

            .lookBackground {
                flex: 1 1 auto;
                min-height: 120px;
                border-radius: 5px;
                background: radial-gradient(circle, rgba(202, 209, 219, 1) 0%, rgba(102, 113, 129, 1) 60%);
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                box-shadow: 0 4px 0 0px rgba(0, 0, 0, 0.15);

                img {
                    z-index: 2;
                    max-width: 100%;
                    max-height: 100%;
                    image-rendering: pixelated;
                }

                &::after {
                    position: absolute;
                    content: ' ';
                    background-color: #667181;
                    width: 300px;
                    height: 200px;
                    bottom: -125px;
                    z-index: 1;
                    border-radius: 50%;
                }
            }

            .buttonContainer {
                flex: 0 0 auto;

                .saveButton {
                    border-radius: 5px;
                    width: 100%;
                    height: 46px;
                    background-color: #009d2f;
                    color: #fff;
                    padding: 0 10px;
                    cursor: pointer;
                    border: 0;
                    outline: none;
                    font-family: "Ubuntu", sans-serif;
                    font-size: 1.3rem;
                    text-shadow: 1px 1px 0 rgba(0, 0, 0, .5);
                    box-shadow: 0 4px 0 0px rgba(0, 0, 0, 0.15), inset 0 4px 0 0px rgba(255, 255, 255, 0.15), inset 0 -4px 0 0px rgba(0, 0, 0, 0.15);

                    &:hover {
                        background-color: #00b737;
                    }
                }
            }
        }

        .palettesContainer {
            grid-area: colors;
            display: flex;
            gap: 10px;
            min-height: 0;

            .palette {
                display: grid;
                grid-template-columns: repeat(3, 36px);
                grid-auto-rows: 36px;
                align-content: start;
                gap: 4px;
                overflow-x: hidden;
                overflow-y: auto;
                border-radius: 5px;

                .color {
                    border-radius: 5px;
                    position: relative;
                    box-shadow: inset 2px 2px 0 2px rgba(0, 0, 0, .25);
                    cursor: pointer;
                    user-select: none;

                    &.selected {
                        box-shadow: inset 0 0 0 3px rgba(0, 0, 0, .4);

                        &::after {
                            content: ' ';
                            position: absolute;
                            inset: 3px;
                            border: 2px solid #fff;
                            border-radius: 5px;
                            box-shadow: inset 0 -4px 0 0px rgba(0, 0, 0, .25);
                        }

                        &::before {
                            content: ' ';
                            position: absolute;
                            top: 7px;
                            left: 8px;
                            right: 8px;
                            height: 4px;
                            border-radius: 33px;
                            background-color: rgba(255, 255, 255, .5);
                        }
                    }
                }
            }
        }
    }
}

/* tablet: the colors go under the parts, in rows that scroll sideways */
@media (max-width: 760px) {
    .changelookUI {
        height: min(560px, calc(100vh - 70px));
    }

    .changeLookContainer .tabContainer {
        grid-template-columns: 64px minmax(0, 1fr) 130px;
        grid-template-rows: minmax(0, 1fr) auto;
        grid-template-areas:
            "side parts preview"
            "colors colors colors";

        .palettesContainer {
            flex-direction: column;
            gap: 6px;

            .palette {
                grid-template-columns: none;
                grid-auto-flow: column;
                grid-auto-columns: 32px;
                grid-auto-rows: 32px;
                overflow-x: auto;
                overflow-y: hidden;
                padding-bottom: 4px;
            }
        }
    }
}

/* phone: everything in one column, the dialog scrolls */
@media (max-width: 480px) {
    .changelookUI {
        top: 8px;
        height: calc(100vh - 70px);
    }

    .changeLookContainer {
        overflow-y: auto;

        .tabs {
            padding: 5px 4px 0;
        }

        .tabContainer {
            min-height: auto;
            grid-template-columns: 1fr;
            grid-template-rows: auto 240px auto 220px;
            grid-template-areas:
                "side"
                "parts"
                "colors"
                "preview";

            .firstChoose {
                flex-direction: row;
                justify-content: center;
                overflow-x: auto;
            }
        }
    }
}
</style>
