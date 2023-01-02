<template>
    <div id="inventory" ref="inventory">
        <div class="title-bar" ref="handler">
            <div class="title">Inventory</div>
            <div class="closeIcon" @click="hide()"></div>
        </div>
        <div class="inventoryContainer" v-on:click="deselectItem()">
            <div class="inventoryContainerBg">
                <div class="inventoryTabs">
                    <div class="tab" :class="{ active: currentTab == 'floor' }" @click.stop="changeTab('floor')">
                        Floor
                    </div>
                    <div class="tab" :class="{ active: currentTab == 'wall' }" @click.stop="changeTab('wall')">
                        Wall
                    </div>
                </div>
                <div class="inventoryListAndButtonsContainer">

                    <div class="listContainer itemsContainer" v-if="currentTab == 'floor'">
                        <div class="itemInventory" :class="{ selected: selectedItem && selectedItem.id == item.Id }"
                            v-for="item in floorItems" @click.stop="selectItem(item)" v-bind:key="item.Id">
                            <img v-bind:src="item.objectVisualization.iconImage" :alt="item.Name" />
                            <span class="stackSize">{{ item.qty }}</span>
                        </div>
                    </div>
                    <div class="listContainer itemsContainer" v-if="currentTab == 'wall'">
                        <div class="itemInventory" :class="{ selected: selectedItem && selectedItem.id == item.Id }"
                            v-for="item in wallItems" @click.stop="selectItem(item)" v-bind:key="item.Id">
                            <img :src="item.objectVisualization.iconImage" alt="item.Name" />
                            <span class="stackSize">{{ item.qty }}</span>
                        </div>
                    </div>
                    <div class="buttonsContainer">
                        <div class="itemPreivew">
                            <img v-if="selectedItem" v-bind:src="getImagePreview(selectedItem)" />
                        </div>
                        <div class="ui-button small" :class="{ hidden: !showPlaceItemButton }" ref="PlaceItemButton"
                            @click.stop="placeItem()">Place</div>
                        <div class="ui-button small" :class="{ hidden: !showAddAllItemsToTradeButton }"
                            ref="AddItemToTradeButton" @click.stop="addAllItemsToTrade">
                            Trade</div>
                        <div class="ui-button small" :class="{ hidden: !showAddAllItemsToTradeButton }"
                            ref="AddAllItemsToTradeButton" @click.stop="addAllItemsToTrade()">
                            Trade</div>
                    </div>
                </div>
                <div class="tradeContainer" :class="{ hidden: !tradeMode }">
                    <div class="trade-container">
                        <div>
                            <span>Your offer</span>
                            <ul id="mytradeitems" ref="mytradeitems" class="itemsContainer">
                                <div class="itemInventory" v-for="item in myTradeItems" v-bind:key="item.id">
                                    <img :src="item.icon" :alt="item.name" />
                                    <span class="stackSize">{{ item.qty }}</span>
                                </div>
                            </ul>
                        </div>
                        <div>
                            <button id="acceptTradeButton" class="tradeButton"
                                v-on:click.stop="acceptTrade()">Accept</button>
                            <button id="declineTradeButton" class="tradeButton"
                                v-on:click.stop="cancelTrade()">Decline</button>
                        </div>
                        <div>
                            <span id="targetTradeName">{{ trade.targetTradeName }}</span>
                            <div id="targettradeitems" ref="targettradeitems" class="itemsContainer">
                                <div class="itemInventory" v-for="item in targetTradeItems" v-bind:key="item.id">
                                    <img :src="item.icon" :alt="item.name" />
                                    <span class="stackSize">{{ item.qty }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import ItemVisualization from "../../../game/core/room/object/items/visualization/ItemVisualization"
import { Engine } from "../../../game/Engine"
import Item from "../../../game/engine/room/objects/items/Item"
import { BoxEvent } from "../../../game/engine/ui/events/general/BoxEvent"
import { EventManager } from "../../../game/engine/ui/events/EventManager"
import { UIEvents } from "../../../game/engine/ui/events/UIEvents"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"
import { UIEventsType } from "../../../game/engine/ui/events/UIEventsType"

const tradeMode = ref(false)
const myTradeItems = ref([])
const targetTradeItems = ref([])

const showPlaceItemButton = ref(false)

const trade = ref({
    targetTradeName: ""
})

const selectedItem = ref()

let currentTab = ref("floor");

const floorItems = ref([])
const wallItems = ref([])

const showAddAllItemsToTradeButton = ref(false)

function addAllItemsToTrade() {

}

function placeItem() {
    this.hide()
    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.RoomPlaceItemEvent, {
        id: this.selectedItem.id,
        name: this.selectedItem.name,
        x: 2,
        y: 0,
        z: 0
    })

}

function getImagePreview(item: Item) {
    return (item.visualization as ItemVisualization).imagePreview
}

function changeTab(tab: string) {
    switch (tab) {
        case 'floor':
            this.currentTab = tab
        break;
        case 'wall':
            this.currentTab = tab
        break;
    }

    this.showPlaceItemButton = false

}

function selectItem(item: Item) {
    this.selectedItem = item

    if (Engine.getInstance().roomService.CurrentRoom != undefined) {
        this.showPlaceItemButton = true
    }

}

function deselectItem() {

}

function acceptTrade() {

}

function cancelTrade() {

}

function hide() {
    EventManager.emit<BoxEvent>(UIEvents.CLOSE, {
        type: UIEventsType.INVENTORY,
    })
}
onMounted(() => {
    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.RequestInventoryItemsEvent)
})
</script>

<style lang="scss">
#inventory {
    position: fixed;
    height: 340px;
    width: 490px;
    left: 20vw;
    top: 20vh;
    pointer-events: all;
    display: flex;
    background-color: #F1EEE7;
    overflow: hidden;
    border-radius: 8px;
    flex-wrap: wrap;
    flex-flow: column;
    font-family: 'Ubuntu', sans-serif;
    z-index: 10000;

    &::after {
        content: ' ';
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .15);
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        pointer-events: none;
    }

    .title-bar {
        background-color: transparent;
        height: 30px;
        display: flex;
        flex-flow: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        font-weight: 700;
        color: #272727;

        .closeIcon {
            position: absolute;
            right: 8px;
            top: 6px;
            width: 19px;
            height: 20px;
            cursor: pointer;
            background: url("~@/assets/images/closeIcon.png") no-repeat;

            &:hover {
                background: url("~@/assets/images/closeIconHover.png") no-repeat;
            }
        }
    }



    .inventoryContainer {
        position: relative;
        margin-top: 0px;
        width: 100%;
        height: 100%;

        .inventoryContainerBg {
            padding-left: 4px;
            padding-right: 4px;
            padding-bottom: 4px;
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;

            .inventoryTabs {
                padding-top: 5px;
                padding-left: 16px;
                padding-right: 16px;

                display: flex;
                width: 100%;

                justify-items: center;
                align-items: center;
                justify-content: left;

                .tab {
                    text-align: center;
                    border-radius: 4px;
                    border-bottom: 0;
                    padding: 3px;
                    color: #272727;
                    background-color: #D5D5D5;
                    position: relative;
                    cursor: pointer;
                    user-select: none;

                    &.active {
                        background-color: #fff;
                        color: #272727;

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

            .inventoryListAndButtonsContainer {
                margin-left: 5px;
                margin-right: 5px;

                display: flex;
                flex-direction: row;
                width: 100%;
                height: 100%;

                overflow-y: auto;
                background-color: #F1EEE7;

                .listContainer {
                    width: 65%;
                    overflow-y: scroll;
                    padding: 4px 16px 4px 4px;
                }

                .buttonsContainer {
                    width: 35%;
                    padding: 4px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;

                    .itemInfoPanelButton {
                        margin: 3px;
                        background-color: #fff;
                        color: #000;
                        padding-left: 3px;
                        padding-right: 3px;
                        border-radius: 12px;
                        font-weight: 600;
                        border: 1px solid #000;
                        font-size: 13px;
                        text-align: center;
                        cursor: pointer;

                        &:hover {
                            background-color: #878787;
                        }
                    }
                }
            }

            .tradeContainer {
                margin-top: 2px;
                margin-left: 5px;
                margin-right: 5px;

                display: flex;
                flex-direction: row;
                width: calc(100% - 5px * 2);
                height: calc(50% - 37px);

                border-radius: 12px;
                border: 1px solid #000;
                padding: 4px;

                overflow-y: auto;

                .trade-container {
                    display: table;
                    width: 100%;
                    table-layout: fixed;

                    div {
                        list-style-type: none;
                        display: table-cell;
                        text-align: center;
                        vertical-align: middle;
                        padding: 2px;
                        border-right: 1px solid #333;

                        &:last-child {
                            border-right: none;
                        }
                    }

                    .tradeButton {
                        margin: 3px;
                        background-color: #fff;
                        color: #000;
                        padding-left: 3px;
                        padding-right: 3px;
                        border-radius: 12px;
                        font-weight: 600;
                        border: 1px solid #000;
                        font-size: 13px;
                        text-align: center;
                        cursor: pointer;

                        &:hover {
                            background-color: #878787;
                        }
                    }
                }
            }
        }
    }

    &.tradeMode {
        height: 500px;

        .inventoryListAndButtonsContainer {
            height: 50% !important;
        }
    }

    .itemsContainer {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-start;
        flex-flow: row wrap;
        align-content: flex-start;

        .itemInventory {
            border: 1px solid #000;
            background-color: #cbcbcb;
            margin: 2px;
            width: 38px;
            height: 38px;
            text-align: center;
            position: relative;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-content: center;

            .stackSize {
                position: absolute;
                top: 1px;
                right: 0;
                background-color: #fff;
                border: 1px solid #2f6982;
                color: #2f6982;
                font-size: 9px;
                font-family: Volter;
                height: 15px;
                line-height: 15px;
                padding: 0;
                padding-left: 2px;
                padding-right: 2px;
            }

            &.selected,
            &:hover {
                box-shadow: inset 0 0 0 2px #fff;
            }

            img {
                object-fit: none;
            }
        }
    }

    .itemPreivew {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 180px;
        margin-bottom: 5px;

        img {
            height: 100%;
            object-fit: scale-down;
        }
    }
}
</style>