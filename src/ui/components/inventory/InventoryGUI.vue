<template>
    <Dialog title="Inventory" :className="'inventory' + (tradeMode ? ' tradeMode' : '')" :box="UIEventsType.INVENTORY">
        <div class="sub">
            <div class="item" :class="{ active: currentTab == 'floor' }" @click.stop="changeTab('floor')">Floor</div>
            <div class="item" :class="{ active: currentTab == 'wall' }" @click.stop="changeTab('wall')">Wall</div>
        </div>

        <div class="inventoryContainer" @click="deselectItem()">
            <div class="inventoryContainerBg">
                <div class="inventoryListAndButtonsContainer">
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
import { onMounted, ref } from "vue"
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