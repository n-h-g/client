<template>
    <div id="previewBox" ref="previewBox" draggable="false">
        <!-- the card of a user (as Habbo's infostand) -->
        <div v-if="mode == 'user'" class="previewBoxContainer userPreview">
            <div class="userCard">
                <div class="userCardTop">
                    <span class="userCardName">{{ entity.name }}</span>
                    <span class="userCardClose" title="Close" @click="hide()"></span>
                </div>

                <div class="userCardBody">
                    <div class="userCardAvatar">
                        <img v-if="avatarImage || entity.image" :src="avatarImage || entity.image" alt="" />
                    </div>
                    <div v-if="userId != null" class="userCardBadges">
                        <div v-for="slot in BADGE_SLOTS" :key="slot" class="userCardBadge">
                            <img v-if="badges[slot - 1] && !brokenBadges[badges[slot - 1]]" :src="badgeImage(badges[slot - 1])"
                                :title="badges[slot - 1]" alt="" @error="brokenBadges[badges[slot - 1]] = true" />
                        </div>
                    </div>
                </div>

                <div v-if="userId != null" class="userCardMotto" :class="{ editable: isSelf }" @click="startEditMotto()">
                    <span v-if="isSelf" class="userCardPencil"></span>
                    <input v-if="editingMotto" ref="mottoInput" v-model="mottoDraft" class="userCardMottoInput"
                        :maxlength="MOTTO_LENGTH" @keydown.enter.prevent="saveMotto()" @keydown.esc="editingMotto = false"
                        @blur="saveMotto()" @click.stop />
                    <span v-else class="userCardMottoText">{{ motto || (isSelf ? 'Click to write your motto' : '') }}</span>
                </div>
            </div>
            <div class="previewBoxContainerButtons" v-if="isSelf">
                <div class="previewButton" @click.stop="changeLook()">Look</div>
            </div>
        </div>

        <div v-else class="previewBoxContainer" v-bind:class="((mode == 'item'))?'itemPreview':'userPreview'">
            <div class="previewBoxContainerInfo">
                <div class="titleBar">
                    <span class="title">
                        {{ entity.name }}
                    </span>
                    <span class="closeIcon" @click="hide()">-</span>
                </div>
                <div class="userInfoContainer">
                    <div class="imageContainer">
                        <img ref="playerImage" :src="entity.image" />
                    </div>
                    <div class="badgeContainer">

                    </div>
                </div>
                <div class="additionalInfoContainer">
                    <p>{{ entity.motto }}</p>
                </div>
            </div>
            <div class="previewBoxContainerButtons" v-if="mode == 'item'" >
                <div class="previewButton" ref="moveItemButton" id="moveItemButton"
                    :class="{hidden: false}" @click.stop="moveItem()">
                    Move</div>

                <div class="previewButton" ref="rotateItemButton" id="rotateItemButton"
                    :class="{hidden: false}" @click.stop="rotateItem()" v-if="entity ? canRotate() : true">
                    Rotate</div>

                <div class="previewButton" ref="pickItemButton" id="pickItemButton"
                    :class="{hidden: false}" @click.stop="pickItem()">
                    Pick</div>

                <div class="previewButton" ref="useItemButton" id="useItemButton"
                    :class="{hidden: false}" @click.stop="useItem()" v-if="entity ? isAnimated(): true">
                    Use</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, reactive, ref } from 'vue'
import { AvatarHeadImage } from '../../../game/engine/ui/imagers/avatars/AvatarHeadImage'
import { UserInfoData } from '../../../game/engine/events/ui/data/users/UserInfoData'
import { EventManager } from '../../../game/core/events/EventManager'
import { ItemLogic } from '../../../game/core/room/object/items/logic/ItemLogic'
import { ItemVisualization } from '../../../game/core/room/object/items/visualization/ItemVisualization'
import { Engine } from '../../../game/Engine'
import { DialogEventData } from '../../../game/engine/events/ui/data/general/Dialog'
import { PreviewModeEventData } from '../../../game/engine/events/ui/data/general/PreviewUserData'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { UIEventsType } from '../../../game/engine/events/ui/UIEventsType'
import {Item} from '../../../game/engine/room/objects/items/Item'
import {FloorItem} from '../../../game/engine/room/objects/items/FloorItem'
import { OutgoingPacket } from '../../../game/networking/packets/outgoing/OutgoingPacket'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import { ChangeLookEventData } from '../../../game/engine/events/ui/data/avatar/ChangeLookEventData'

const mode = ref('')
const entity = ref({
    id: '',
    name: '',
    image: '',
    motto: ''
})

// ---------------- the card of a user
const BADGE_SLOTS = [1, 2, 3, 4, 5]
const MOTTO_LENGTH = 38

const userId = ref<number | null>(null)
const isSelf = ref(false)
const motto = ref('')
const badges = ref<string[]>([])
const brokenBadges = reactive<Record<string, boolean>>({})
/** The whole avatar, standing (the image of the room is the avatar as it is, e.g. sitting). */
const avatarImage = ref('')
const editingMotto = ref(false)
const mottoDraft = ref('')
const mottoInput = ref<HTMLInputElement | null>(null)

function onPreview(evt: PreviewModeEventData) {
    const sameUser = evt.mode == 'user' && evt.userId != null && evt.userId === userId.value

    mode.value = evt.mode
    entity.value.name = evt.name
    entity.value.image = evt.image
    entity.value.motto = evt.motto
    entity.value.id = evt.id

    if (evt.mode != 'user') return

    if (!sameUser) {
        motto.value = ''
        badges.value = []
        editingMotto.value = false
        avatarImage.value = ''
    }
    userId.value = evt.userId ?? null
    isSelf.value = !!evt.isSelf

    const look = evt.look
    if (look) AvatarHeadImage.full(look, 4).then(image => { if (entity.value.id === evt.id && image) avatarImage.value = image })

    if (userId.value != null) {
        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RequestUserInfoEvent, { userId: userId.value })
    }
}

function onUserInfo(info: UserInfoData) {
    if (info.userId !== userId.value) return

    motto.value = info.motto
    badges.value = info.badges
}

EventManager.read(UIEvents.PREVIEW_BOX_MODE, onPreview)
EventManager.read(UIEvents.USER_INFO, onUserInfo)
onUnmounted(() => {
    EventManager.off(UIEvents.PREVIEW_BOX_MODE, onPreview)
    EventManager.off(UIEvents.USER_INFO, onUserInfo)
})

function badgeImage(code: string): string {
    return Engine.getInstance().config.badgesUrl.replace('%badgename%', encodeURIComponent(code))
}

function startEditMotto() {
    if (!isSelf.value || editingMotto.value) return

    mottoDraft.value = motto.value
    editingMotto.value = true
    nextTick(() => mottoInput.value?.focus())
}

function saveMotto() {
    if (!editingMotto.value) return
    editingMotto.value = false

    const newMotto = mottoDraft.value.trim().slice(0, MOTTO_LENGTH)
    if (newMotto === motto.value) return

    motto.value = newMotto
    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.UpdateMottoEvent, { motto: newMotto })
}

function isAnimated() {
    const item = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository?.get(entity.value.id) as Item | undefined
    return item?.base?.data?.visualization?.type == 'furniture_animated'
}

/**
 * The "Rotate" button: only a floor furni with more than one rotation (e.g. not a rug, a table with one
 * direction or a wall furni, that the server doesn't rotate).
 */
function canRotate() {
    const item = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository?.get(entity.value.id)
    return item instanceof FloorItem && (item.base?.getAvailableDirections().length ?? 0) > 1
}

function moveItem() {
    const item = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository?.get(entity.value.id) as Item
    Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository?.setRollingEntity(item);
    (item.logic as ItemLogic).toggleMovement(true)
}

function pickItem() {
    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomPickupItemEvent, {
        id: entity.value.id
    })
}

function rotateItem() {
    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomRotateItemEvent, {
        id: entity.value.id
    })
}

/** The "Use" button: as the double click on the furni (the next state, sent to the server). */
function useItem() {
    const item = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository?.get(entity.value.id) as Item | undefined
    const logic = item?.logic as { onDoubleClick?: () => void } | undefined

    if (logic?.onDoubleClick) {
        logic.onDoubleClick()
        return
    }

    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomUseItemEvent, {
        id: entity.value.id
    })
}

function changeLook() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(UIComponent.ChangeLookUI).toggle() 
}

function hide(): void {
    EventManager.emit<DialogEventData>(UIEvents.CLOSE, {
        type: UIEventsType.PREVIEWBOX
    })
}
</script>

<style lang="scss">
@import '@/assets/scss/game.scss';

#previewBox {
    position: fixed;
    right: 12px;
    bottom: 90px;
    pointer-events: all !important;

    /* the card of a user (as Habbo's infostand) */
    .userCard {
        width: 196px;
        padding: 6px;
        box-sizing: border-box;
        background: rgba(40, 40, 38, .95);
        border: 1px solid #1a1a19;
        border-radius: 6px;
        font-family: Ubuntu, sans-serif;
        color: #fff;
        user-select: none;

        .userCardTop {
            display: flex;
            align-items: center;
            gap: 6px;
            height: 20px;
            margin-bottom: 6px;
        }

        .userCardName {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            font-weight: 700;
        }

        .userCardClose {
            position: relative;
            flex: 0 0 14px;
            height: 14px;
            border: 1px solid #8a8a86;
            border-radius: 2px;
            cursor: pointer;

            &::before,
            &::after {
                content: "";
                position: absolute;
                left: 6px;
                top: 2px;
                width: 2px;
                height: 10px;
                background: #c8c8c4;
                transform: rotate(45deg);
            }

            &::after {
                transform: rotate(-45deg);
            }

            &:hover {
                border-color: #fff;

                &::before,
                &::after {
                    background: #fff;
                }
            }
        }

        .userCardBody {
            display: flex;
            gap: 6px;
        }

        .userCardAvatar {
            flex: 1;
            height: 130px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            overflow: hidden;
            background: #6f6f6c;
            border: 1px solid #575754;
            border-radius: 8px;

            img {
                margin-bottom: 6px;
                image-rendering: pixelated;
            }
        }

        .userCardBadges {
            flex: 0 0 84px;
            display: grid;
            grid-template-columns: repeat(2, 40px);
            grid-auto-rows: 40px;
            gap: 4px;
            align-content: start;
        }

        .userCardBadge {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
                max-width: 40px;
                max-height: 40px;
                image-rendering: pixelated;
            }
        }

        .userCardMotto {
            display: flex;
            align-items: center;
            gap: 6px;
            min-height: 26px;
            margin-top: 8px;
            padding: 3px 8px;
            box-sizing: border-box;
            background: #4a4a47;
            border: 1px solid #5c5c58;
            border-radius: 6px;

            &.editable {
                cursor: text;

                &:hover {
                    background: #545450;
                }
            }
        }

        .userCardPencil {
            flex: 0 0 17px;
            height: 18px;
            background: url("@/assets/images/bottom-bar/pencil-icon.png") no-repeat center;
        }

        .userCardMottoText {
            flex: 1;
            min-width: 0;
            font-size: 12px;
            text-align: center;
            word-break: break-word;
        }

        .userCardMottoInput {
            flex: 1;
            min-width: 0;
            padding: 2px 4px;
            background: #fff;
            border: 1px solid #000;
            border-radius: 3px;
            font-family: inherit;
            font-size: 12px;
            color: #000;
            outline: none;
        }
    }

    .previewBoxContainer {
        display: flex;
        flex-direction: column;


        &.userPreview {
            .previewBoxContainerInfo {
                width: 190px;
                height: auto;
            }
        }

        .previewBoxContainerInfo {
            flex-grow: 3;
            //height: 300px;
            border-radius: 5px;
            background-color: #2E2E2C;
            width: 209px;
            padding: 4px;

            hr {
                border: 0;
                border-top: 1px solid #333;
            }

            .titleBar {
                display: flex;
                flex-direction: row;
                margin-bottom: 2px;
                font-size: 15px;


                .title {
                    text-align: center;
                    flex-grow: 5;
                    padding: 5px;
                    /*border-top-left-radius: 12px;
                        border-bottom-left-radius: 12px;
                        background-color: #424242;*/
                    font-size: 15px;
                    color: #eee;
                    margin-right: 4px;
                    font-weight: 700;
                    margin: 0;

                }

                .closeIcon {
                    position: absolute;
                    right: 10px;
                    top: 0;
                    font-size: 20px;
                    text-align: center;
                    padding: 1.5px;
                    /*border-top-right-radius: 12px;
                        border-bottom-right-radius: 12px;
                        background-color: #424242;*/
                    color: #ffb31a;
                    cursor: pointer;

                }
            }
        }

        .userInfoContainer {
            padding: 0px;
            display: inline;
            flex-direction: row;
            flex-grow: 6;
            width: 100%;
            justify-content: center;

            .imageContainer {
                width: 65px;
                padding-left: 5px;
                padding-top: 15px;
                z-index: -1;
                border-radius: 5px;
                margin: 0 auto;
            }

            .imageContainer img {
                width: 75%;
                background-color: transparent;
            }

            .badgeContainer {
                visibility: hidden;
                width: 100px;
                flex-wrap: wrap;
                align-content: flex-start;
                display: flex;
            }

            .mottoContainer {
                flex-grow: 1;
                color: #eee;

                font-size: 9px;
            }
        }

        .itemImageContainer {
            padding: 4px;
            display: flex;
            align-content: center;
            justify-content: center;
            flex-direction: row;

            img {
                height: auto;
                align-self: center;
            }
        }

        .additionalInfoContainer {

            flex-grow: 1;
            padding: 4px 4px 15px 0px;
            color: #eee;
            cursor: text;
            margin: 0;
            color: #fff;
            word-break: break-word;
            text-align: center;
            font-size: 14px;

            .infoTags {
                margin-top: 5px;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: space-between;

                &>span {
                    padding: 0px 4px;
                    color: #eee;
                    background-color: #3d3d3d;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                    box-sizing: border-box;
                }
            }
        }

        .previewBoxContainerButtons {
            margin-top: 10px;
            min-height: 20px;
            /* background-color: #fff;*/

            display: flex;
            flex-direction: row;
            user-select: none;

            .previewButton {
                margin: 3px;
                background-color: #2E2E2C;
                color: #fff;
                //padding-left: 3px;
                //padding-right: 3px;
                border-radius: 5px;
                font-family: Ubuntu, sans-serif;
                font-weight: 500;
                //font-size: 13px;
                cursor: pointer;
                user-select: none;
                font-size: 13px;
                padding: 10px 6px;
                line-height: 16px;

                &:hover {
                    background-color: #fa0;
                }
            }
        }
    }
}
</style>