<template>
    <Dialog title="Inventory" :className="'inventory' + (tradeMode ? ' tradeMode' : '')" :box="UIEventsType.INVENTORY">
        <div class="sub">
            <div class="item" :class="{ active: currentTab == 'floor' }" @click.stop="changeTab('floor')">Floor</div>
            <div class="item" :class="{ active: currentTab == 'wall' }" @click.stop="changeTab('wall')">Wall</div>
            <div class="item" :class="{ active: currentTab == 'pets' }" @click.stop="changeTab('pets')">Pets</div>
            <div class="item" :class="{ active: currentTab == 'bots' }" @click.stop="changeTab('bots')">Bots</div>
            <div class="item" :class="{ active: currentTab == 'badges' }" @click.stop="changeTab('badges')">Badges</div>
        </div>

        <div class="inventoryContainer" @click="deselectItem()">
            <div class="inventoryContainerBg">
                <!-- pets, bots and badges: their own list and panel -->
                <div class="inventoryListAndButtonsContainer" v-if="currentTab == 'pets'">
                    <div class="listContainer itemsContainer">
                        <div class="inventoryEmpty" v-if="pets.length == 0">Non hai animali</div>
                        <div class="itemInventory petInventory"
                            :class="{ selected: selectedPet && selectedPet.id === pet.id }"
                            v-for="pet in pets" :key="pet.id"
                            :title="pet.name"
                            @click.stop="selectedPet = pet">
                            <img v-if="petImages[petKey(pet)]" :src="petImages[petKey(pet)]" class="petImage" />
                            <span v-else class="petInitial" :style="{ color: '#' + pet.color }">{{ pet.name.charAt(0).toUpperCase() }}</span>
                        </div>
                    </div>
                    <div class="buttonsContainer">
                        <template v-if="selectedPet">
                            <img v-if="petImages[petKey(selectedPet)]" :src="petImages[petKey(selectedPet)]" class="petImageLarge" />
                            <div class="itemName">{{ selectedPet.name }}</div>
                            <div class="itemDetails">{{ petTypeName(selectedPet.type) }}</div>
                            <div class="buttonList">
                                <div class="ui-button small" v-if="inRoom" @click.stop="placePet()">Place</div>
                                <div class="itemDetails muted" v-else>Entra in una stanza per metterlo</div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="inventoryListAndButtonsContainer" v-else-if="currentTab == 'bots'">
                    <div class="listContainer itemsContainer">
                        <div class="inventoryEmpty" v-if="bots.length == 0">Non hai bot (scrivi :bot nome per crearne uno)</div>
                        <div class="itemInventory"
                            :class="{ selected: selectedBot && selectedBot.id === bot.id }"
                            v-for="bot in bots" :key="bot.id"
                            :title="bot.name"
                            @click.stop="selectedBot = bot">
                            <img v-if="botHeads[bot.look]" :src="botHeads[bot.look]" class="botHead" />
                        </div>
                    </div>
                    <div class="buttonsContainer">
                        <template v-if="selectedBot">
                            <div class="itemName">{{ selectedBot.name }}</div>
                            <div class="itemPreview">
                                <img v-if="botHeads[selectedBot.look]" :src="botHeads[selectedBot.look]" class="botHeadLarge" />
                            </div>
                            <div class="buttonList">
                                <div class="ui-button small" v-if="inRoom" @click.stop="placeBot()">Place</div>
                                <div class="itemDetails muted" v-else>Entra in una stanza per metterlo</div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="inventoryListAndButtonsContainer" v-else-if="currentTab == 'badges'">
                    <div class="listContainer itemsContainer badgesContainer">
                        <div class="wornBadges">
                            <span class="label">Indossati</span>
                            <div class="badgeSlot" v-for="slot in wornSlots" :key="slot.index"
                                :class="{ selected: slot.badge && selectedBadge && selectedBadge.code === slot.badge.code }"
                                @click.stop="slot.badge && (selectedBadge = slot.badge)">
                                <img v-if="slot.badge && !brokenBadges[slot.badge.code]" :src="badgeImage(slot.badge.code)"
                                    @error="brokenBadges[slot.badge.code] = true" />
                                <span v-else-if="slot.badge" class="badgeCode">{{ slot.badge.code }}</span>
                            </div>
                        </div>
                        <div class="inventoryEmpty" v-if="badges.length == 0">Non hai badge</div>
                        <div class="itemInventory badgeInventory"
                            :class="{ selected: selectedBadge && selectedBadge.code === badge.code, worn: badge.slot > 0 }"
                            v-for="badge in badges" :key="badge.code"
                            :title="badge.code"
                            @click.stop="selectedBadge = badge">
                            <img v-if="!brokenBadges[badge.code]" :src="badgeImage(badge.code)" @error="brokenBadges[badge.code] = true" />
                            <span v-else class="badgeCode">{{ badge.code }}</span>
                        </div>
                    </div>
                    <div class="buttonsContainer">
                        <template v-if="selectedBadge">
                            <div class="itemName">{{ selectedBadge.code }}</div>
                            <div class="itemPreview">
                                <img v-if="!brokenBadges[selectedBadge.code]" :src="badgeImage(selectedBadge.code)" class="badgeLarge" />
                                <span v-else class="badgeCode">{{ selectedBadge.code }}</span>
                            </div>
                            <div class="buttonList">
                                <div class="ui-button small" v-if="selectedBadge.slot > 0" @click.stop="setBadgeWorn(selectedBadge, false)">Togli</div>
                                <div class="ui-button small" v-else-if="wornBadges.length < MAX_WORN_BADGES" @click.stop="setBadgeWorn(selectedBadge, true)">Indossa</div>
                                <div class="itemDetails muted" v-else>Puoi indossare al massimo {{ MAX_WORN_BADGES }} badge</div>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="inventoryListAndButtonsContainer" v-else>
                    <div class="listContainer itemsContainer">
                        <template v-if="currentTab == 'floor'">
                            <div class="itemInventory" 
                                :class="{ selected: selectedItem && selectedItem.id === item.id }"
                                v-for="item in floorItems" 
                                :key="item.id"
                                @click.stop="selectItem(item)">
                                <img :src="getImageIcon(item)" />
                                <span v-if="item.qty > 1" class="stackSize">{{ item.qty }}</span>
                            </div>
                        </template>
                        <template v-else>
                            <div class="itemInventory" 
                                 :class="{ selected: selectedItem && selectedItem.id === item.id }"
                                 v-for="item in wallItems" :key="item.id"
                                 @click.stop="selectItem(item)">
                                <img :alt="item.Name" :src="getImageIcon(item)"/>
                                <span v-if="item.qty > 1" class="stackSize">{{ item.qty }}</span>
                            </div>
                        </template>
                    </div>

                    <div class="buttonsContainer">
                        <div class="itemName" v-if="selectedItem">
                            {{ getItemName(selectedItem) }}
                        </div>
                        <div class="itemPreview">
                            <img v-if="selectedItem" :src="preview || getImageIcon(selectedItem)" />
                        </div>
                        <div class="buttonList">
                            <div class="ui-button small" v-if="showPlaceItemButton" @click.stop="placeItem()">{{ isDecoration(selectedItem) ? 'Apply' : 'Place' }}</div>
                            <div class="ui-button small" v-if="showAddAllItemsToTradeButton" @click.stop="addAllItemsToTrade()">Trade</div>
                        </div>
                    </div>
                </div>

                <div class="tradeContainer" v-if="tradeMode">
                    <div class="trade-container">
                        <div class="trade-column">
                            <span class="label">Your offer</span>
                            <div class="itemsGrid smallGrid">
                                <div class="itemInventory" v-for="item in myTradeItems" :key="item.id">
                                    <img :src="item.icon" />
                                    <span class="stackSize">{{ item.qty }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="trade-actions">
                            <button class="tradeButton" @click.stop="acceptTrade()">Accept</button>
                            <button class="tradeButton" @click.stop="cancelTrade()">Decline</button>
                        </div>
                        <div class="trade-column">
                            <span class="label">{{ trade.targetTradeName }}</span>
                            <div class="itemsGrid smallGrid">
                                <div class="itemInventory" v-for="item in targetTradeItems" :key="item.id">
                                    <img :src="item.icon" />
                                    <span class="stackSize">{{ item.qty }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import { ItemVisualization } from "../../../game/core/room/object/items/visualization/ItemVisualization"
import { Engine } from "../../../game/Engine"
import {Item} from "../../../game/engine/room/objects/items/Item"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import Dialog from '../dialog/Dialog.vue'
import { UIComponent } from "../../../game/engine/ui/components/UIComponent"
import { IComponentShowableUI } from "../../../game/core/ui/IComponentShowableUI"
import { EventManager } from "../../../game/core/events/EventManager"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { InventoryItemsEventData } from "../../../game/engine/events/ui/data/inventory/InventoryItems"
import { FurniPreview } from "../../../game/engine/ui/imagers/items/utils/FurniPreview"
import { ItemType } from "../../../game/core/room/object/items/ItemType"
import { RoomDecorationLibrary } from "../../../game/engine/room/decoration/RoomDecorationLibrary"
import { AvatarHeadImage } from "../../../game/engine/ui/imagers/avatars/AvatarHeadImage"
import { PetFigureData } from "../../../game/engine/ui/imagers/pets/PetFigureData"
import { petTypeName } from "../../../game/engine/ui/imagers/pets/PetType"
import { InventoryBadge, InventoryBadgesData, InventoryBot, InventoryBotsData, InventoryPet, InventoryPetsData } from "../../../game/engine/events/ui/data/inventory/InventoryTabs"

const tradeMode = ref(false)
const myTradeItems = ref([])
const targetTradeItems = ref([])
const showPlaceItemButton = ref(false)
const trade = ref({
    targetTradeName: ""
})
const selectedItem = ref()
const currentTab = ref("floor");
const floorItems = ref([])
const wallItems = ref([])
const showAddAllItemsToTradeButton = ref(false)

// the server always sends the whole inventory (on open, after placing and after picking up a furni)
EventManager.read(UIEvents.INVENTORY_ITEMS_ADDED, (data: InventoryItemsEventData) => {
    const floor = []
    const wall = []

    // the copies of the same furni are one slot with the amount (the slot uses the first copy's id)
    const groups = new Map<string, any>()

    for (let item of data.items) {
        const group = groups.get(slotKey(item))

        if (group) {
            group.qty++
            group.ids.push(item.id)
            continue
        }

        const slot = { ...item, qty: 1, ids: [item.id] }
        groups.set(slotKey(item), slot)

        if (item.item_type == ItemType.FLOOR_ITEM)
            floor.push(slot)
        else
            wall.push(slot)
    }

    floorItems.value = floor
    wallItems.value = wall

    // after placing a copy the slot stays selected while there are copies left
    if (selectedItem.value) {
        const slot = groups.get(slotKey(selectedItem.value))

        if (slot) selectedItem.value = slot
        else deselectItem()
    }
})

// pets, bots and badges: asked to the server when their tab is opened

const pets = ref<InventoryPet[]>([])
const bots = ref<InventoryBot[]>([])
const badges = ref<InventoryBadge[]>([])
const selectedPet = ref<InventoryPet | null>(null)
const selectedBot = ref<InventoryBot | null>(null)
const selectedBadge = ref<InventoryBadge | null>(null)

/** As Habbo: up to 5 badges worn. */
const MAX_WORN_BADGES = 5

/** The images of the pets (see PetImager), by figure. */
const petImages = reactive<Record<string, string>>({})

function petKey(pet: InventoryPet): string {
    return PetFigureData.from(pet.type, pet.race, pet.color).figureString
}

/** The heads of the bots, by look. */
const botHeads = reactive<Record<string, string>>({})
/** The badges without image (the album has no image with that code): their code is shown. */
const brokenBadges = reactive<Record<string, boolean>>({})

const inRoom = computed(() => Engine.getInstance()?.roomService?.currentRoom != undefined)

const wornBadges = computed(() => badges.value.filter(badge => badge.slot > 0).sort((a, b) => a.slot - b.slot))
const wornSlots = computed(() => Array.from({ length: MAX_WORN_BADGES }, (_, index) => ({
    index,
    badge: wornBadges.value[index] ?? null,
})))

EventManager.read(UIEvents.INVENTORY_PETS, (data: InventoryPetsData) => {
    pets.value = data.pets
    if (selectedPet.value) selectedPet.value = data.pets.find(pet => pet.id === selectedPet.value!.id) ?? null

    const imager = Engine.getInstance()?.userInterfaceManager?.petImager
    for (const pet of data.pets) {
        const key = petKey(pet)
        if (!imager || petImages[key] !== undefined) continue

        // drawn once for each figure; without its library the initial stays
        petImages[key] = ''
        imager.getImage(key).then(image => {
            if (image) petImages[key] = image
            else delete petImages[key]
        })
    }
})

EventManager.read(UIEvents.INVENTORY_BOTS, (data: InventoryBotsData) => {
    bots.value = data.bots
    // e.g. the bot placed: it's not in the inventory anymore
    if (selectedBot.value) selectedBot.value = data.bots.find(bot => bot.id === selectedBot.value!.id) ?? null

    for (const bot of data.bots) {
        if (!bot.look || botHeads[bot.look] !== undefined) continue

        botHeads[bot.look] = ''
        AvatarHeadImage.get(bot.look).then(image => {
            if (image) botHeads[bot.look] = image
            else delete botHeads[bot.look]
        })
    }
})

EventManager.read(UIEvents.INVENTORY_BADGES, (data: InventoryBadgesData) => {
    badges.value = data.badges
    if (selectedBadge.value) selectedBadge.value = data.badges.find(badge => badge.code === selectedBadge.value!.code) ?? null
})


function badgeImage(code: string): string {
    return Engine.getInstance().config.badgesUrl.replace('%badgename%', encodeURIComponent(code))
}

/** The bot goes in the room, next to the user. */
function placeBot() {
    if (!selectedBot.value) return

    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.PlaceBotEvent, { id: selectedBot.value.id })
}

/** The pet goes in the room, next to the user (only where the user has rights: the server checks it). */
function placePet() {
    if (!selectedPet.value) return

    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.PlacePetEvent, { id: selectedPet.value.id })
}

/** Wears the badge (in the first free slot) or takes it off: the server sends the badges again. */
function setBadgeWorn(badge: InventoryBadge, worn: boolean) {
    const codes = wornBadges.value.map(other => other.code).filter(code => code !== badge.code)
    if (worn) codes.push(badge.code)

    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.SetWornBadgesEvent, {
        codes: codes.slice(0, MAX_WORN_BADGES),
    })
}

/** The data of the tab, from the server. */
function requestTab(tab: string) {
    const packets: Record<string, OutgoingPacket> = {
        pets: OutgoingPacket.RequestInventoryPetsEvent,
        bots: OutgoingPacket.RequestInventoryBotsEvent,
        badges: OutgoingPacket.RequestInventoryBadgesEvent,
    }

    if (packets[tab] != null) Engine.getInstance()?.networkingManager?.packetManager?.applyOut(packets[tab])
}

function addAllItemsToTrade() {

}

/**
 * The copies of a furni are one slot; the wallpapers/floors/landscapes are one slot per decoration
 * (wallpaper 101 and wallpaper 102 are different items).
 */
function slotKey(item: any): string {
    return isDecoration(item) ? `${item.name}:${item.extra_data ?? ''}` : item.name
}

function isDecoration(item: any): boolean {
    return !!item && RoomDecorationLibrary.isDecorationItem(item.name)
}

function getItemName(item: any): string {
    const name = item.name || item.Name
    return isDecoration(item) && item.extra_data ? `${name} ${item.extra_data}` : name
}

function placeItem() {
    if (!selectedItem.value) return;

    const engine = Engine.getInstance();

    // a wallpaper/floor/landscape is not placed: it changes the room look (the server consumes it)
    if (isDecoration(selectedItem.value)) {
        engine.networkingManager.packetManager.applyOut(
            OutgoingPacket.RoomApplyDecorationEvent,
            { id: selectedItem.value.id }
        )
        return;
    }

    engine.roomService.startItemPlacement(selectedItem.value)
    
    
    hide();
}

function getImageIcon(item: Item) {
    // Nitro icons: <name>_icon.png, with the color variant after an underscore (chair_plasto*2 -> chair_plasto_2_icon.png)
    return Engine.getInstance().config.itemsIconsUrl + item.name.replace("*", "_") + "_icon.png"
}


function changeTab(tab: string) {
	currentTab.value = tab;
    showPlaceItemButton.value = false
    requestTab(tab)
}

// the furni drawn in the preview panel (the icon is shown until it's ready)
const preview = ref("")

async function selectItem(item: any) {
    selectedItem.value = item
    preview.value = ""

    FurniPreview.render(item.name)
        .then(image => {
            if (image && selectedItem.value && slotKey(selectedItem.value) === slotKey(item)) preview.value = image
        })
        .catch(() => {})

    if (Engine.getInstance()?.roomService?.currentRoom != undefined)
        showPlaceItemButton.value = true
}

function deselectItem() {
    selectedItem.value = null;
    showPlaceItemButton.value = false;
}

function acceptTrade() {

}

function cancelTrade() {

}

function hide() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.InventoryUI).hide()
}

onMounted(() => {
    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RequestInventoryItemsEvent)
})
</script>

<style lang="scss">
.inventory {
    position: fixed;
    height: 380px; // Aumentato leggermente per respirare
    width: 490px;

    .inventoryContainer {
        height: calc(100% - 45px); // Sottrai l'altezza delle tab
        width: 100%;
        display: flex;
        flex-direction: column;

        .inventoryContainerBg {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding: 5px;
            overflow: hidden; // Impedisce scorrimenti esterni indesiderati
        }
    }

    .inventoryListAndButtonsContainer {
        display: flex;
        flex-direction: row;
        flex: 1;           // Occupa tutto lo spazio verticale disponibile
        min-height: 0;     // IMPORTANTE: permette al figlio di scorrere
        background-color: #ebebeb;
        border: 1px solid #333;
        border-radius: 4px;

        .listContainer {
            flex: 1;       // Prende lo spazio rimasto dalla sidebar
            overflow-y: auto; // ATTIVA LO SCROLL
            padding: 8px;
            display: flex;
            flex-wrap: wrap;
            align-content: flex-start;
            gap: 2px;
            
            // Scrollbar stile retrò
            &::-webkit-scrollbar { width: 14px; }
            &::-webkit-scrollbar-thumb {
                background: #ccc;
                border: 2px solid #ebebeb;
                border-radius: 10px;
            }
        }

        .buttonsContainer {
            width: 160px;
            display: flex;
            flex-direction: column;
            padding: 10px;
            background: #f4f4f4;
            border-left: 1px solid #ccc;

            .itemPreview {
                height: 120px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 10px;
                background: white;
                border-radius: 4px;
                border: 1px solid #ccc;
                img { max-width: 100%; max-height: 100%; object-fit: contain; }
            }

            .buttonList {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .itemName {
                font-size: 13px;
                font-weight: bold;
                text-align: center;
                color: #333;
                margin-bottom: 8px;
                word-wrap: break-word; // Gestisce nomi molto lunghi
                padding: 0 5px;
                min-height: 1.2em; // Mantiene lo spazio anche se vuoto
            }

            .itemPreview {
                height: 120px;
                // ... resto dello stile invariato
            }
        }
    }

    // Modalità Scambio
    &.tradeMode {
        height: 520px;
        
        .inventoryListAndButtonsContainer {
            flex: 0 0 240px; // Altezza fissa per la lista quando c'è il trade
        }

        .tradeContainer {
            margin-top: 8px;
            flex: 1;
            background: #d9d9d9;
            border: 1px solid #000;
            padding: 5px;
            border-radius: 4px;
            display: flex;

            .trade-container {
                display: flex;
                width: 100%;
                gap: 5px;

                .trade-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    .label { font-size: 11px; font-weight: bold; margin-bottom: 3px; }
                }

                .itemsGrid {
                    flex: 1;
                    background: #eee;
                    border: 1px solid #999;
                    overflow-y: auto;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2px;
                    padding: 4px;
                }

                .trade-actions {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 5px;
                }
            }
        }
    }

    // Stile quadratini inventario
    .inventoryEmpty {
        width: 100%;
        padding: 20px 10px;
        color: #777;
        font-size: 12px;
        text-align: center;
    }

    .itemDetails {
        font-size: 11px;
        text-align: center;
        color: #333;
        margin-bottom: 6px;

        &.muted {
            color: #888;
            font-style: italic;
        }
    }

    .petInitial {
        font-size: 20px;
        font-weight: bold;
        text-shadow: 0 1px 0 #333, 0 -1px 0 #333, 1px 0 0 #333, -1px 0 0 #333;
    }

    .petImage {
        max-width: 38px !important;
        max-height: 38px !important;
        image-rendering: pixelated;
    }

    .petImageLarge {
        display: block;
        margin: 0 auto 6px;
        image-rendering: pixelated;
    }

    .botHead {
        max-width: 38px !important;
        max-height: 38px !important;
    }

    .botHeadLarge {
        image-rendering: pixelated;
        transform: scale(1.5);
    }

    .badgeInventory.worn {
        background: #d6e9c6;
    }

    .badgeCode {
        font-size: 8px;
        font-weight: bold;
        color: #333;
        word-break: break-all;
        text-align: center;
    }

    .badgeLarge {
        image-rendering: pixelated;
        transform: scale(1.5);
    }

    .badgesContainer .wornBadges {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 4px;
        padding-bottom: 6px;
        margin-bottom: 4px;
        border-bottom: 1px solid #ccc;

        .label {
            font-size: 11px;
            font-weight: bold;
            margin-right: 4px;
        }

        .badgeSlot {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            border: 1px dashed #999;
            border-radius: 4px;
            cursor: pointer;

            &.selected {
                box-shadow: inset 0 0 0 2px #333;
            }

            img { max-width: 36px; max-height: 36px; }
        }
    }

    .itemInventory {
        width: 40px;
        height: 40px;
        background: #cbcbcb;
        border: 1px solid #333;
        border-radius: 4px;
        position: relative;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            background: #fff;
            box-shadow: inset 0 0 0 2px #333;
        }

        img { max-width: 32px; max-height: 32px; }

        .stackSize {
            position: absolute;
            top: 1px;
            right: 1px;
            border-radius: 3px;
            font-weight: bold;
            background: #fff;
            border: 1px solid #333;
            font-size: 9px;
            padding: 0 2px;
            pointer-events: none;
        }
    }
}
</style>