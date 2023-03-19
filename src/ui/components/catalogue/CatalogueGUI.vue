<template>
    <Dialog title="Catalogue" class-name="catalogue" :box="UIEventsType.CATALOGUE">
        <div class="header">
            <div class="headerImage">
                <img v-if="activePage && activePage.rawInfo && activePage.rawInfo.headerImage && activePage.rawInfo.headerImage != ''"
                    :src="resourceUrl + activePage.rawInfo.headerImage" />
            </div>
            <div class="iconContainer">
                <img v-if="currentMenu && currentMenu.iconImage"
                    :src="resourceUrl + currentMenu.iconImage + '.png'" />
            </div>
            <div class="menuTitleWrapper">
                <span class="menuTitle">
                    {{ currentMenu.title }}
                </span>
                <span class="menuDescription">
                    {{ currentMenu.description }}
                </span>
            </div>
        </div>
        <div class="wrapper">
            <div class="catalogueMenu">
                <ul class="menuUlCatalog">
                    <TreeMenu :catalogMenu="catalogMenu" :currentMenu="currentMenu"/>
                </ul>
            </div>
            <div class="cataloguePageContainer" v-if="currentCataloguePage && currentCataloguePage.items">
                <div class="cataloguePage" ref="cataloguePage">
                    <div class="default_grid">
                        <div id="placeHolder" v-if="{selectedItem}">
                            <img :src="preview" />
                        </div>
                        <div class="defaultGridLayoutItemContainer">
                            <div class="itemCell catalogItemCell" id="catalogItem${items[i].id}" data-credits="${items[i].credits}" data-itemid="${items[i].id}" data-publicname="${items[i].itemBase.publicName}" v-for="item in currentCataloguePage.items" :key="item.id">
                                <span class="itemIcon"><img id="catalogItem${items[i].id}_iconimage" :src="getIcon(item)" onclick="selectItem(item)"></span>  
                                <span class="price">{{item.credits}}<img src='@/assets/images/catalogue/creditIcon.png' /></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { generate } from "@vue/compiler-core"
import { ref } from "vue"
import { CataloguePageItem } from "../../../game/core/communication/incoming/catalogue/CataloguePageItem"
import { EventManager } from "../../../game/core/events/EventManager"
import { Engine } from "../../../game/Engine"
import { CataloguePageData } from "../../../game/engine/events/ui/data/catalogue/CataloguePageData"
import { CataloguePagesData } from "../../../game/engine/events/ui/data/catalogue/CataloguePagesData"
import { UIEvents } from "../../../game/engine/events/ui/UIEvents"
import { UIEventsType } from "../../../game/engine/events/ui/UIEventsType"
import Room from "../../../game/engine/room/Room"
import { FurnidataItemType } from "../../../game/engine/ui/imagers/items/FurniImager"
import { OutgoingPacket } from "../../../game/networking/packets/outgoing/OutgoingPacket"
import Point from "../../../game/utils/point/Point"
import Point3d from "../../../game/utils/point/Point3d"
import UiUtils from "../../../game/utils/UiUtils"
import Dialog from "../dialog/Dialog.vue"
import TreeMenu from "./TreeMenu.vue"

Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.CatalogPagesListEvent)

const resourceUrl = Engine.getInstance().config.catalogueResourcesUrl + "icons/"

let catalogMenu = ref([])
let activePage = ref({
    rawInfo: {
        headerImage: ""
    }
})

const selectedItem = ref()

const currentCataloguePage = ref({items: []} as {
    items: CataloguePageItem[]
})

const preview = ref("")

generatePlaceHolder(null).then((image: string) => {
    preview.value = image
})

let currentMenu = ref({
    id: 1,
    title: "titolo",
    description: "",
    iconImage: "1"
})

EventManager.read(UIEvents.CATALOGUE_PAGES_UPDATED, (data: CataloguePagesData) => {
    data.pages.forEach((page) => {
        
        if(catalogMenu.value.indexOf(page) < 0) {
            catalogMenu.value.push(page)
        }
    })

})

EventManager.read(UIEvents.CATALOG_ITEMS_UPDATED, (data: CataloguePageData) => {
    data.items.forEach((item) => {
        if(hasItem(item.id)) return;

        currentCataloguePage.value.items.push(item)
    })

})

function selectItem(item) {
    this.selectedItem.value = item
}

async function generatePlaceHolder(item: CataloguePageItem): Promise<string> {
    return await Engine.getInstance().userInterfaceManager.roomImager.generateRoomPreview(new Room("", "00001111/00001111/00001111/00001111", new Point(0, 0), 0))
}

function getIcon(catalogItem: CataloguePageItem) {

    Engine.getInstance().userInterfaceManager.furniImager.loadFurniIcon(FurnidataItemType.FloorItem, catalogItem.name).then((sprite) => {
        sprite.start()
        
        setTimeout(() => {
            catalogItem.icon = UiUtils.generateBase64FromObject(sprite)
        }, 300);
    })

    return catalogItem.icon
}

function hasItem(id: number): boolean {
    currentCataloguePage.value.items.forEach((item) => {
        return item.id == id
    })

    return false
}

function openPage() {
    console.log('dasd')
}
</script>

<style lang="scss">
.catalogue {
    position: absolute;
    z-index: 2;
    height: 620px;
    width: 568px;

    .header {
        height: 90px;
        width: 100%;
        display: flex;
        background-color: #0e3f52;
        color: #fff;
        flex-direction: row;
        position: relative;

        .iconContainer {
            width: 80px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1;

            img {
                width: 32px;
                height: 32px;
                image-rendering: pixelated;
            }
        }

        .headerImage {
            position: absolute;
            width: 100%;
            height: 100%;
            left: 0;
            top: 0;
            z-index: 0;

            img {
                opacity: 0.1;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }

        .menuTitleWrapper {
            flex: 1;
            padding: 15px 15px 0 0;
            z-index: 1;

            .menuTitle {
                display: block;
                font-size: 1.3rem;
                font-weight: 700;
                margin-bottom: 2px;
                z-index: 1;
            }

            .menuDescription {
                font-size: .8rem;
                z-index: 1;
            }
        }
    }


    .wrapper {
        flex: 1;
        display: flex;
        width: 100%;
        flex-flow: row;
        flex-wrap: wrap;
        padding: 6px;
        overflow: hidden;
    }

    .cataloguePageContainer {
        flex: 1;
        padding-left: 6px;
        padding-bottom: 6px;
        overflow-x: hidden;
        overflow-y: auto;
        height: 100%;

        .cataloguePage {
            color: #000;
            flex: 1;
            padding-left: 6px;

            .default_grid {

                #placeHolder {
                    background-color: #000
                }
                #placeHolder img {
                    margin-left: 35px;
                    text-align:center;
                    justify-content:center;
                }
            }
        }
    }



    .catalogueMenu {
        width: 180px;
        height: 100%;
        background-color: #d2d1cb;
        border: 1px solid #808080;
        overflow-y: scroll;
        box-sizing: border-box;
        border-radius: 8px;
        padding: 2px;
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 1);




        /* .closeIcon {
                position: absolute;
                right: 25px;
                top: 6px;
                color: #fff;
                width: 13px;
                height: 13px;
                border: 1px solid #fff;
                background-color: #6794a7;
                cursor: pointer;

                &:before,
                &:after {
                    position: absolute;
                    left: 5px;
                    content: ' ';
                    height: 11px;
                    width: 1px;
                    background-color: #fff;
                }

                &:before {
                    transform: rotate(45deg);
                }

                &:after {
                    transform: rotate(-45deg);
                }
            */

    }
}

.menuUlCatalog {
    width: 100%;

    .treeView {

        .catalogLi {
            flex-direction: row;
            cursor: pointer;
            width: 100%;
            background: #fff;
            border: none;
            border-bottom: 1px solid #000;
            padding: 0;

        }

        .catalogLiIcon {
            display: block;
            width: 23px;
            height: 20px;
            display: flex;
            border-top: 2px solid hsla(0, 0%, 100%, .3);
            border-bottom: 1px solid rgba(0, 0, 0, .3);
            border-right: 1px solid rgba(0, 0, 0, .3);
            box-sizing: border-box;
        }

        .catalogMenuLabel {
            line-height: 22px;
            padding-left: 3px;
            font-weight: 700;
        }
    }
}
    .default_grid {
        overflow: hidden;
        padding-top: 0px;
        padding-right: 6px;
        display: flex;
        flex-direction: column;

        #placeholder {
            background-color: #000;
        }

        .defaultGridLayoutTitle {
            margin-bottom: 10px;
            flex-grow: 0;
            font-weight: 500;
        }

        .defaultGridLayoutText {
            flex-grow: 0;
            margin-bottom: 20px;
        }

        .defaultGridLayoutItemContainer {
            height: 152px;
            border-radius: 8px;
            border: 1px solid #757571;
            box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 1);
            background-color: #d2d1cb;
            padding: 2px;
            flex: 1;

            display: inline-flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: flex-start;
            min-height: 180px;


            &>.itemCell {
                width: 50px;
                height: 60px;
                overflow: hidden;
                cursor: pointer;
                margin: 2px;
                border-radius: 8px;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;

                &.selected {
                    border: 2px solid #62c4e8;
                    background-color: #fff;

                }

                .itemIcon {
                    min-height: 38px;
                    flex: 1;
                    width: 100%;
                    align-items: center;
                    justify-content: center;
                    display: flex;
                }

                .price {
                    margin-top: 2px;
                    font-weight: 700;
                    text-align: right;
                    width: 100%;

                    img {
                        vertical-align: middle;
                    }
                }
            }
        }

        //.defaultGridLayoutItemContainer > .itemCell > img {}

    }

    .cataloguePage.frontpage {
        //overflow-y: auto !important;

        .cards-list {
            padding: 10px;
        }

        .card {
            box-sizing: content-box;
            margin-bottom: 20px;
            box-shadow: 0 0 20px 0 #666;
            border-radius: 10px;
            overflow: hidden;
            position: relative;
            background: #fff;
        }

        .card-header {
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 300px;
            color: #fff;
            background-position: center;
            background-size: cover;
        }

        .card-header>.head-title>h1 {
            margin-bottom: 10px;
        }
    }
</style>
