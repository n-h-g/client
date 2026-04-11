<template>
    <Dialog title="ChangeLook" class-name="changelookUI" :box="UIEventsType.CHANGE_LOOK" :style="{ marginTop: '300px', marginLeft: '400px', width: '70vh' }">
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
                <div class="firstChoose" v-if="currentTab != 'faceAndBody'">
                    <div class="chooseTab" v-for="(tab, key) in currentMainTab.tabs" :key="key"
                        :class="{active: secondTabId == key}" @click="changeSecondTab(key)">
                        <img :src="getSecondTabImage(tab.image)" />
                    </div>
                </div>
                <div class="parts"
                    :class="currentTab != 'faceAndBody' ? currentMainTab.tabs[secondTabId].type : 'faceAndBody'">
                    <div class="part" v-for="part in partSet" :key="part.key"
                        :class="{selected: part.selected, hc: part.isHc, loaded: part.loaded}"
                        @click="handleChangePart(part, part.figure)">
                        <img :src="part.img" /> 
                    </div>
                </div>
                <div class="lookPreview">
                    <div class="lookBackground">
                        <img v-if="lookImage != ''" :src='lookImage' />
                    </div>
                    <div class="buttonContainer">
                        <button class="saveButton"
                            @click="saveLook">Salva</button>
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
import { UiUtils } from '../../../game/utils/UiUtils'
import avatarLoadingImage from '../../../assets/images/loading.png'
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType";
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { AvatarFigure } from '../../../game/engine/ui/imagers/avatars/AvatarFigure'
import { Avatar } from '../../../game/engine/ui/imagers/avatars/Avatar'
import { AvatarImager } from '../../../game/engine/ui/imagers/avatars/AvatarImager'
import { AvatarEventsType } from '../../../game/engine/ui/imagers/avatars/enum/events/AvatarEventsType'
import { ChangeLookEventData } from '../../../game/engine/events/ui/data/avatar/ChangeLookEventData'

import { EventManager } from '../../../game/core/events/EventManager'
import { ActionId } from "../../../game/engine/ui/imagers/avatars/enum/actions/ActionId"
import { Container } from "pixi.js"

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

const currentTab = ref<string>('faceAndBody')
const secondTabId = ref<number>(0)
const gender = ref<string>('M')
const look = ref<string>('hd-180-1.ch-255-66.lg-280-110.sh-305-62.ha-1012-110.hr-828-61');
const partSet = ref<any[]>([])
const lookImage = ref<string>('')
let palettes = ref<any[]>([])
const handlerRef = ref<HTMLElement | null>(null)

watch(look, () => {
    generateLookPreview();
}, { immediate: false });

EventManager.read(UIEvents.CHANGE_LOOK, (evt: ChangeLookEventData) => {
    //console.log(evt)
    look.value = evt.look
})
    

    let renderQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

async function processQueue() {
    if (isProcessingQueue || renderQueue.length === 0) return;
    isProcessingQueue = true;
    while (renderQueue.length > 0) {
        const task = renderQueue.shift();
        if (task) await task();
    }
    isProcessingQueue = false;
}

const currentMainTab = computed(() => {
    return avatarTabs.find(e => e.id === currentTab.value)
})

function hide() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.ChangeLookUI)?.hide()
}

function show() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.ChangeLookUI)?.show()
}

function setDefaultTabs() {
    currentTab.value = 'faceAndBody'
    secondTabId.value = 0
    generateLookPreview()
}

function getSecondTabImage(image: string) {
    // Uso compatibile con Vite/Webpack moderno
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

function calculateCurrentPart() {
    const avatarMainTab = avatarTabs.find(e => e.id === currentTab.value)
    if (!avatarMainTab) return undefined

    const avatarTab = avatarMainTab.tabs[secondTabId.value]
    const figure = new AvatarFigure(look.value);
    const parts = figure.parts;
    
    return parts.find((value: any) => value.type === avatarTab.type)
}

function calculateCurrentColor(colorId: number) {
    const avatarMainTab = avatarTabs.find(e => e.id === currentTab.value)
    if (!avatarMainTab) return 0

    const avatarTab = avatarMainTab.tabs[secondTabId.value]
    const figure = new AvatarFigure(look.value)
    const parts = figure.parts
    const value = parts.find((value: any) => value.type === avatarTab.type)
    
    if (value !== undefined) {
        return value.colors[colorId] || 0
    } else {
        return 0
    }
}

async function generateAvatarDataUrl(figure: string, headOnly: boolean = false): Promise<string> {
    const engine = Engine.getInstance();
    const imager = engine?.userInterfaceManager?.avatarImager;

    if (!imager || !engine) return "";

    const actions = new Set<ActionId>();
    actions.add("std" as any); 

    const avatar = new Avatar(figure, 2, 2, actions, 0, 0, false, false, true);
        
    await imager.loadAvatar(avatar);
    imager.drawAvatar(avatar); 

    return new Promise((resolve) => {
        avatar.Events?.on(AvatarEventsType.LOAD_COMPLETE, () => {
            const renderer = (engine as any).application?.renderer;
                
            if (!renderer) {
                resolve("");
                return;
            }

            let targetContainer;

            if (headOnly) {
                const headContainer = new Container();
                // Add head and face for the small icons
                if (avatar.HeadContainer) headContainer.addChild(avatar.HeadContainer);
                if (avatar.FaceContainer) headContainer.addChild(avatar.FaceContainer);
                targetContainer = headContainer;
            } else {
                // Ensure the Face is attached to the main container for the full preview
                if (avatar.Container && avatar.FaceContainer) {
                    avatar.Container.addChild(avatar.FaceContainer);
                }
                targetContainer = avatar.Container;
            }
            
            if (!targetContainer) {
                resolve("");
                return;
            }

            const canvas = renderer.extract.canvas(targetContainer);
            resolve(UiUtils.trimCanvas(canvas).toDataURL());
        });
    });
}

function generateLookPreview() {
    setUpLookComponents();


    generateAvatarDataUrl(look.value, false).then(dataUrl => {
        //console.log(dataUrl)
        lookImage.value = dataUrl;
    });
}

function generatePartImage(figure: string, type: string, partSetKey: number | string) {
    const isHeadOnly = type === 'faceAndBody';

    renderQueue.push(async () => {
        const dataUrl = await generateAvatarDataUrl(figure, isHeadOnly);
        const element = partSet.value.find(e => e.key == partSetKey);
        if (element) {
            element.img = dataUrl;
            element.loaded = true;
        }
    });

    processQueue();
    return avatarLoadingImage;
}

function generatePartSet() {
    partSet.value = [];
    
    const avatarMainTab = avatarTabs.find(e => e.id === currentTab.value);
    if (!avatarMainTab) return;

    const avatarTab = avatarMainTab.tabs[secondTabId.value];
    const avatarImager = Engine.getInstance()?.userInterfaceManager.avatarImager;
    
    const figureData = avatarImager?.Structure?.AvatarFigureData;
    const setType = figureData?.getSetByType(avatarTab.type);
    const currentPartSets = setType?.partSets;

    const currentPart = calculateCurrentPart();

    let currentColor = calculateCurrentColor(0).toString();
    if (currentPart != null && currentPart.colors.length > 1) {
        currentColor += "-" + calculateCurrentColor(1);
    }

    if (!avatarTab.required) {
        partSet.value.push({ 
            type: avatarTab.type,
            key: -1,
            img: new URL("../../../assets/images/look_editor/removeSelection.png", import.meta.url).href,
            isHc: false,
            selected: false,
            loaded: true 
        });
    }

    if (currentPartSets) {
        currentPartSets.forEach((part: any, partId: string) => {
            const figure = avatarTab.type + "-" + partId + "-" + currentColor;
            
            if ((part.gender === gender.value || part.gender === 'U') && part.selectable) {
                partSet.value.push({ // CORRETTO: .value.push
                    type: avatarTab.type,
                    key: partId,
                    img: generatePartImage(figure, avatarMainTab.id, partId),
                    isHc: part.club && part.club > 0,
                    loaded: false,
                    figure: figure,
                    selected: currentPart != null && currentPart.id === partId.toString(),
                });
            }
        });
    }
}

function handleChangePart(part: any, figure: string) {
    partSet.value.forEach(e => e.selected = false);
    
    const avatarFigure = new AvatarFigure(look.value);
    
    if (part.key == -1) {

        const filteredParts = avatarFigure.look.filter((p: any) => p.type !== part.type);
        look.value = generateFigureString(filteredParts);
    } else {

        const newPartFigure = new AvatarFigure(part.type + "-" + part.key);
        const newPart = newPartFigure.look[0];
        
        const currentPart = avatarFigure.look.find((p: any) => p.type === part.type);
        if (currentPart) newPart.colors = currentPart.colors;

        const otherParts = avatarFigure.look.filter((p: any) => p.type !== part.type);
        look.value = generateFigureString([...otherParts, newPart]);
    }
    
    part.selected = true;
    generateLookPreview();
}


function generatePalette(paletteId: number) {
    const avatarMainTab = avatarTabs.find(e => e.id === currentTab.value);
    if (!avatarMainTab) return [];

    const avatarTab = avatarMainTab.tabs[secondTabId.value];
    const figureData = Engine.getInstance()?.userInterfaceManager?.avatarImager?.Structure?.AvatarFigureData;
    
    const setType = figureData?.getSetByType(avatarTab.type);
    if (!setType) return [];

    const palette = figureData?.getPalette(setType.paletteid.toString());
    if (!palette) return [];

    const colors: any[] = [];
    const currentColor = calculateCurrentColor(paletteId);

    palette.colors.forEach((colorData: any, colorIdStr: string) => {
        const colorId = parseInt(colorIdStr);
        colors.push({
            isHc: colorData.club > 0,
            selected: colorId === parseInt(currentColor),
            paletteId: paletteId,
            colorId: colorId,
            backgroundColor: colorData.color
        });
    });

    return colors;
}

function generatePalettes() {
    const currentPart = calculateCurrentPart();
    palettes.value = [];
    
    let colorCount = currentPart ? Math.max(1, currentPart.colors.length) : 1;
    
    for (let i = 0; i < colorCount; i++) {
        palettes.value.push({
            key: i,
            colors: generatePalette(i)
        });
    }
}

function generateFigureString(parts: any[]): string {
    return parts.map(part => {
        let str = `${part.type}-${part.id}`;
        if (part.colors && part.colors.length > 0) {
            str += `-${part.colors.join('-')}`;
        }
        return str;
    }).join('.');
}

function handleChangeColor(color: any, palette: any) {
    const currentPart = calculateCurrentPart()
    if (currentPart != null) {
        currentPart.colors[palette.key] = color.colorId.toString()
        look.value = generateFigureString(
            new AvatarFigure(look.value + "." + generateFigureString([currentPart])).look
        )
        palette.colors.forEach((e: any) => {
            e.selected = false
        })
        generateLookPreview()
        color.selected = true
    }
}

function saveLook() {
    Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.UserChangeLookEvent, {
        look: look.value,
        gender: gender.value
    })
    hide()
}

onMounted(() => {
    setDefaultTabs()
})
</script>

<style lang="scss" scoped>

.changeLookContainer {
    width: 630px; /* Adattato per contenere le flexbox interne senza rompere l'UI */
    height: 345px;
    display: flex;
    flex-direction: column;
    background-color: transparent; /* Il background globale ora lo darà il Dialog */

    .tabs {
        padding-top: 5px;
        padding-left: 16px;
        padding-right: 16px;
        border-bottom: 1px solid #000;
        display: flex;
        width: 100%;
        justify-items: center;
        align-items: center;
        justify-content: left;

        .tab {
            text-align: center;
            border-top-left-radius: 4px;
            border-top-right-radius: 4px;
            border: 1px solid #000;
            border-bottom: 0;
            padding: 3px;
            color: #000;
            background-color: #c3c2b8;
            position: relative;
            cursor: pointer;
            user-select: none;

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

    .tabContainer {
        width: 100%;
        height: calc(100% - 33px);
        display: flex;
        flex-direction: row;

        .firstChoose {
            width: 75px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 5px;

            .chooseTab {
                background-color: #cbd1d8;
                padding: 4px;
                width: 50px;
                height: 50px;
                display: flex;
                justify-content: center;
                align-content: center;
                position: relative;
                cursor: pointer;
                user-select: none;
                margin: 5px;
                border-radius: 5px;
                box-shadow: inset 2px 2px 0 2px rgba(0, 0, 0, .25);

                span {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

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
            width: 275px;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            overflow-y: auto;
            overflow-x: hidden;
            margin: 5px 10px;
            border-radius: 5px;
            height: calc(100% - 10px);

            .part {
                height: 50px;
                width: 50px;
                background-color: #b3b5bc;
                display: flex;
                justify-content: center;
                align-content: center;
                margin: 2px;
                border-radius: 5px;
                box-shadow: inset 2px 2px 0 2px rgba(0, 0, 0, .25);
                cursor: pointer;
                user-select: none;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;

                img {
                    max-width: 90%;
                    max-height: 90%;
                    object-fit: contain; 
                    pointer-events: none;
                }

                &.loaded {
                    img {
                        position: static; 
                        transform: none;
                    }
                }

                &.selected {
                    background-color: #fff;
                    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, .4);
                }
            }
        }

        .lookPreview {
            width: 150px;
            height: calc(100% - 10px);
            background-color: #c2ced4;
            border-radius: 5px;
            margin: 5px 10px;

            .lookBackground {
                border-radius: 5px;
                height: calc(70% - 20px);
                margin: 10px;
                width: calc(100% - 20px);
                background: rgb(202, 209, 219);
                background: radial-gradient(circle, rgba(202, 209, 219, 1) 0%, rgba(102, 113, 129, 1) 60%);
                overflow: hidden;
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
                box-shadow: 0 4px 0 0px rgba(0, 0, 0, 0.15);

                img {
                    z-index: 2;
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
                height: 30%;
                display: flex;
                justify-content: center;
                align-items: flex-end;

                .saveButton {
                    border-radius: 5px;
                    width: calc(100% - 20px);
                    margin-bottom: 15px;
                    height: 50px;
                    background-color: #009d2f;
                    color: #fff;
                    padding: 0 10px;
                    cursor: pointer;
                    border: 0;
                    outline: none;
                    font-family: "Ubuntu", sans-serif;
                    font-size: 1.4rem;
                    text-shadow: 1px 1px 0 rgba(0, 0, 0, .5);
                    box-shadow: 0 4px 0 0px rgba(0, 0, 0, 0.15), inset 0 4px 0 0px rgba(255, 255, 255, 0.15), inset 0 -4px 0 0px rgba(0, 0, 0, 0.15);

                    &:hover {
                        background-color: #00b737;
                    }
                }
            }
        }

        .palettesContainer {
            display: flex;

            .palette {
                width: 150px;
                margin: 5px 10px;
                border-radius: 5px;
                height: calc(100% - 10px);
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                overflow-x: hidden;
                overflow-y: auto;

                .color {
                    width: 40px;
                    height: 40px;
                    border-radius: 5px;
                    margin: 2px;
                    position: relative;
                    box-shadow: inset 2px 2px 0 2px rgba(0, 0, 0, .25);
                    cursor: pointer;
                    user-select: none;

                    &.selected {
                        box-shadow: inset 0 0 0 3px rgba(0, 0, 0, .4);

                        &::after {
                            content: ' ';
                            width: 30px;
                            height: 30px;
                            border: 2px solid #fff;
                            position: absolute;
                            top: 3px;
                            left: 3px;
                            border-radius: 5px;
                            box-shadow: inset 0 -4px 0 0px rgba(0, 0, 0, .25);
                        }

                        &::before {
                            content: ' ';
                            position: absolute;
                            top: 7px;
                            left: 9px;
                            width: 22px;
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
</style>