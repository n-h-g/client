<template>
    <div id="roomGui" ref="roomGui"> 
        <!-- the chat strip at the top of the room, as Habbo/Nitro: the bubbles are born on its bottom line -->
        <div id="chatBubbleContainer" ref="chatBubbleContainer" :style="{ height: chatHeight + 'px' }">
            <div class="chatBubble"
                v-for="message in messages"
                :key="message.internalId"
                :ref="element => setBubbleElement(message, element as HTMLElement | null)"
                :style="{ top: message.top + 'px', left: message.left + 'px', visibility: message.ready ? 'visible' : 'hidden' }"
                :class="['bubble-' + (message.data.style ?? 0), { chatBubbleShout: message.data.shout, chatBubbleWhisper: message.data.whisper, placed: message.placed }]"
                @click="onClickChat(message)">
                <div class="chatBubbleHead">
                    <img v-if="message.head" :src="message.head" @load="onHeadLoad" />
                </div>
                <div v-if="message.data.info" class="chatBubbleContent">{{ message.data.text }}</div>
                <div v-else class="chatBubbleContent">
                    <b>{{ message.data.author?.name }}</b><span v-if="message.data.whisper && message.data.whisperTo" class="chatBubbleWhisperTo"> → {{ message.data.whisperTo }}</span><b>:</b> {{ message.data.text }}
                </div>
                <div class="chatBubblePointer"></div>
            </div>
        </div>
        <div class="roomObjectsContainer" ref="roomObjectsContainer">
            <canvas id="roomPointer" ref="roomPointer" style="position: absolute;"></canvas>
            <div id="roomCanvasContainer" style="position: absolute;" ref="roomCanvasContainer">
            </div>
        </div>
        <!-- the room tools (bottom left, as Habbo): the tab on the left folds them -->
        <div class="roomTools" ref="roomPanel" :class="{ folded: toolsFolded }">
            <div class="roomToolsTab" :title="toolsFolded ? 'Open' : 'Close'" @click="toolsFolded = !toolsFolded">
                <span class="roomToolsTabArrow"></span>
            </div>

            <div v-if="!toolsFolded" class="roomToolsBody">
                <!-- the name of the room, opened by the room button -->
                <div v-if="infoOpen" class="roomToolsInfo">
                    <b>{{ roomPanelInfo.name || 'Unknown' }}</b>
                    <span>by {{ roomPanelInfo.owner || 'Unknown' }}</span>
                </div>

                <ul class="roomToolsList">
                    <!-- the settings of your room, the info of the room of someone else -->
                    <li @click="roomPanelInfo.haveRights ? openSettings() : openComponent(UIComponent.RoomPublicInfoUI)">
                        <span class="roomToolsIcon settings"></span><span class="roomToolsLabel">Settings</span>
                    </li>
                    <li @click="toggleZoom()">
                        <span class="roomToolsIcon zoom"></span><span class="roomToolsLabel">Zoom</span>
                    </li>
                    <li @click="comingSoon('Chat history')">
                        <span class="roomToolsIcon"></span><span class="roomToolsLabel">Chat history</span>
                    </li>
                    <li @click="comingSoon('Like')">
                        <span class="roomToolsIcon"></span><span class="roomToolsLabel">Like</span>
                    </li>
                    <li @click="openComponent(UIComponent.RoomLinkUI)">
                        <span class="roomToolsIcon"></span><span class="roomToolsLabel">Link to this room</span>
                    </li>
                </ul>

                <div class="roomToolsNavigation">
                    <button class="roomToolsButton back" title="Previous room" :disabled="!canGoBack" @click="goToVisited(-1)"></button>
                    <button class="roomToolsButton info" :class="{ active: infoOpen }" title="Room info" @click="infoOpen = !infoOpen"></button>
                    <button class="roomToolsButton forward" title="Next room" :disabled="!canGoForward" @click="goToVisited(1)"></button>
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
/** The rooms visited in this session, to go back and forth (the room tools); kept while the room UI comes and goes. */
const visitedRooms: number[] = []
let visitedIndex = -1
/** The room asked by back/forward: entered, it moves the position in the visited rooms instead of adding one. */
let pendingVisit: number | null = null
/** Zoomed out (half size), as Habbo: it stays from a room to the next. */
let zoomedOut = false
let toolsFoldedSaved = false
</script>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { OutgoingPacket } from '../../../game/networking/packets/outgoing/OutgoingPacket'
import { BubbleAlertData } from '../../../game/engine/events/ui/data/general/BubbleAlertData'
import { EventManager } from '../../../game/core/events/EventManager'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { Engine } from '../../../game/Engine'
import { RoomChatData } from '../../../game/engine/events/ui/data/room/RoomChatData'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import { AvatarHeadImage } from '../../../game/engine/ui/imagers/avatars/AvatarHeadImage'
import { Container } from 'pixi.js'
import { EnterRoomUIEventData } from '../../../game/engine/events/ui/data/room/EnterRoomUIEventData'

/**
 * The room chat: a bubble is born on the bottom line of the chat strip, centered on the avatar that talks,
 * and then it stays there (it doesn't follow the avatar). Every few seconds all the bubbles go up; a new bubble
 * pushes up all the older ones, so they are always in chronological order (see makeRoom).
 */
interface UIChatBubble {
    data: RoomChatData;
    internalId: string;
    /** Screen x of the avatar when it talked. */
    locationX: number;
    left: number;
    top: number;
    width: number;
    height: number;
    /** The bubble was just pushed up: it skips the next periodic movement. */
    skipMovement: boolean;
    /** Measured and placed: shown. */
    ready: boolean;
    /** Shown where it was born: from now on its movements slide (the first placement doesn't, else it comes from the top). */
    placed: boolean;
    head: string;
}

/** Part of the window height used by the chat strip (Nitro's chat.viewer.height.percentage). */
const CHAT_HEIGHT_PERCENTAGE = 0.4
/**
 * The bubbles go up by MOVE_AMOUNT every SCROLL_SPEED ms. Nitro's normal speed (6000 ms) felt too slow: twice as
 * fast, the old messages leave the room sooner.
 */
const SCROLL_SPEED = 3000
const MOVE_AMOUNT = 15
/** Space between the head of the avatar and a bubble born over it. */
const CHAT_HEAD_MARGIN = 8
/** Space between a bubble and the one under it. */
const CHAT_BUBBLE_GAP = 2

let chatMessageCounter = 0

const messages = ref<UIChatBubble[]>([])
const chatHeight = ref(Math.round(window.innerHeight * CHAT_HEIGHT_PERCENTAGE))
const bubbleElements = new Map<string, HTMLElement>()
let scrollInterval: number | undefined

function onClickChat(message: UIChatBubble) {
    if (!message.data.author) return;
    message.data.author.logic.onClick()
}

function setBubbleElement(message: UIChatBubble, element: HTMLElement | null) {
    if (element) bubbleElements.set(message.internalId, element)
    else bubbleElements.delete(message.internalId)
}

/** The head is drawn at half size, as Nitro's chat (its large head scaled by 0.5). */
function onHeadLoad(event: Event) {
    const image = event.target as HTMLImageElement
    image.style.width = Math.round(image.naturalWidth / 2) + 'px'
}

/** Screen y of the top of the avatar (its head, hat, effect). */
function avatarScreenTop(data: RoomChatData): number | null {
    const container = data.author?.visualization?.container as Container | undefined
    if (!container || container.destroyed) return null

    return container.getBounds().y
}

/** Screen x of the avatar: its container is pivoted at the feet, in the middle of the avatar. */
function avatarScreenX(data: RoomChatData): number | null {
    const container = data.author?.visualization?.container as Container | undefined
    if (!container) return null

    return container.toGlobal(container.pivot).x
}

EventManager.read(UIEvents.ROOM_NEW_MESSAGE, async (data: RoomChatData) => {
    const locationX = avatarScreenX(data)
    if (locationX == null) return
    // now: the avatar can be drawn again meanwhile (e.g. it starts talking), and a container just replaced is empty
    // (its bounds at 0: the bubble went over the top of the screen)
    const headTop = avatarScreenTop(data)

    const message: UIChatBubble = {
        data,
        internalId: `chat_msg_${Date.now()}_${chatMessageCounter++}`,
        locationX,
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        skipMovement: false,
        ready: false,
        placed: false,
        head: '',
    }

    messages.value.push(message)
    const bubble = messages.value[messages.value.length - 1]

    const figure = (data.author as any)?.figure as string | undefined
    if (figure) AvatarHeadImage.get(figure).then(head => bubble.head = head)

    // measured once in the page (hidden), then placed
    await nextTick()
    const element = bubbleElements.get(bubble.internalId)
    if (!element) return

    bubble.width = element.offsetWidth
    bubble.height = element.offsetHeight
    bubble.left = Math.max(0, Math.min(window.innerWidth - bubble.width, bubble.locationX - bubble.width / 2))
    // on the bottom line of the chat strip, as Nitro, but never under the avatar that talks
    // (e.g. an avatar high in the screen, with the camera moved): then just over its head
    bubble.top = chatHeight.value - bubble.height
    if (headTop != null) bubble.top = Math.min(bubble.top, headTop - bubble.height - CHAT_HEAD_MARGIN)

    makeRoom(bubble)
    bubble.ready = true

    // drawn in its place first, then the transition is on (for when it goes up)
    requestAnimationFrame(() => requestAnimationFrame(() => bubble.placed = true))
})

/**
 * The new bubble is the lowest one, as Habbo: the older bubbles go up together (all of them, so they keep their
 * order) until the lowest of them is over the new one. The chat reads always in order from top to bottom.
 * Before only the older bubbles over the new one and overlapping it were pushed: a bubble of another avatar, or a
 * new bubble born over the head of an avatar high in the screen, left an older bubble under a newer one.
 */
function makeRoom(chat: UIChatBubble) {
    chat.skipMovement = true

    const older = messages.value.filter(other => other !== chat && other.ready)
    const overlap = Math.max(0, ...older.map(other => other.top + other.height + CHAT_BUBBLE_GAP - chat.top))

    if (overlap > 0) {
        for (const other of older) {
            other.top -= overlap
            other.skipMovement = true
        }
    }

    removeHiddenChats()
}

/** The bubbles gone over the top of the screen. */
function removeHiddenChats() {
    const visible = messages.value.filter(chat => !chat.ready || chat.top > -chat.height * 2)
    if (visible.length !== messages.value.length) messages.value = visible
}

function moveAllChatsUp(amount: number) {
    for (const chat of messages.value) {
        if (!chat.ready) continue

        if (chat.skipMovement) {
            chat.skipMovement = false
            continue
        }

        chat.top -= amount
    }

    removeHiddenChats()
}

// the bubbles keep their distance from the bottom of the strip
function onResize() {
    const newHeight = Math.round(window.innerHeight * CHAT_HEIGHT_PERCENTAGE)
    const delta = chatHeight.value - newHeight

    chatHeight.value = newHeight
    for (const chat of messages.value) chat.top -= delta
}

onMounted(() => {
    scrollInterval = window.setInterval(() => moveAllChatsUp(MOVE_AMOUNT), SCROLL_SPEED)
    window.addEventListener('resize', onResize)
})

onUnmounted(() => {
    window.clearInterval(scrollInterval)
    window.removeEventListener('resize', onResize)
})

function openSettings() {
    Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.RoomInfoUI).toggle()
}

/**
 * The name and the owner of the room, again when its settings are saved. Not "roomPanel": that is the template ref
 * of the panel element, Vue would put the element in it.
 */
const roomPanelInfo = ref({
    name: Engine.getInstance()?.roomService?.currentRoom?.roomInfo.roomName ?? '',
    owner: Engine.getInstance()?.roomService?.currentRoom?.roomInfo.authorName ?? '',
    haveRights: Engine.getInstance()?.roomService?.ownsCurrentRoom() ?? false,
})

function onRoomInfo(event: EnterRoomUIEventData) {
    roomPanelInfo.value = { name: event.name, owner: event.owner, haveRights: event.haveRights }
    onRoomEntered()
}

// ---------------- room tools
const toolsFolded = ref(toolsFoldedSaved)
const infoOpen = ref(true)
const visitedVersion = ref(0)

const canGoBack = computed(() => (visitedVersion.value, visitedIndex > 0))
const canGoForward = computed(() => (visitedVersion.value, visitedIndex < visitedRooms.length - 1))

// the name of the room for a while after entering it (as Habbo), then the room button shows it again
let infoTimer: ReturnType<typeof setTimeout> | undefined

function onRoomEntered() {
    const roomId = Engine.getInstance()?.roomService?.currentRoom?.id
    if (roomId == null || roomId === visitedRooms[visitedIndex]) return

    if (pendingVisit != null && visitedRooms[visitedIndex + pendingVisit] === roomId) {
        visitedIndex += pendingVisit
    } else {
        visitedRooms.splice(visitedIndex + 1)
        visitedRooms.push(roomId)
        visitedIndex = visitedRooms.length - 1
    }
    pendingVisit = null
    visitedVersion.value++

    if (zoomedOut) Engine.getInstance()?.roomService?.currentRoom?.roomLayout.visualization.zoom(0.5)

    infoOpen.value = true
    clearTimeout(infoTimer)
    infoTimer = setTimeout(() => infoOpen.value = false, 5000)
}

function goToVisited(step: -1 | 1) {
    const roomId = visitedRooms[visitedIndex + step]
    if (roomId == null) return

    pendingVisit = step
    Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.UserEnterRoom, { id: roomId })
}

function toggleZoom() {
    zoomedOut = !zoomedOut
    Engine.getInstance()?.roomService?.currentRoom?.roomLayout.visualization.zoom(zoomedOut ? 0.5 : 1)
}

function openComponent(component: UIComponent) {
    Engine.getInstance()?.userInterfaceManager?.componentsManager?.getComponent<IComponentShowableUI>(component)?.show()
}

function comingSoon(feature: string) {
    EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, { message: `${feature}: coming soon!` })
}

watch(toolsFolded, folded => toolsFoldedSaved = folded)
onRoomEntered()
onUnmounted(() => clearTimeout(infoTimer))

EventManager.read(UIEvents.ENTER_ROOM_INFO, onRoomInfo)
onUnmounted(() => EventManager.off(UIEvents.ENTER_ROOM_INFO, onRoomInfo))
</script>


<style lang="scss">
@import "./chatBubbles.scss";

#roomGui {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10000;

    /* the room tools, bottom left (as Habbo) */
    .roomTools {
        position: fixed;
        left: 0;
        bottom: 66px;
        display: flex;
        align-items: stretch;
        pointer-events: all;
        font-family: Ubuntu, sans-serif;
        user-select: none;

        .roomToolsTab {
            flex: 0 0 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #1f1f1d;
            border-radius: 0 0 0 0;
            cursor: pointer;

            &:hover {
                background: #2b2b28;
            }
        }

        .roomToolsTabArrow {
            width: 6px;
            height: 8px;
            background: url("@/assets/images/bottom-bar/room_infoIconLeft.png") no-repeat center;
        }

        &.folded {
            .roomToolsTab {
                height: 60px;
                border-radius: 0 6px 6px 0;
            }

            .roomToolsTabArrow {
                background-image: url("@/assets/images/bottom-bar/room_infoIconRight.png");
            }
        }

        .roomToolsBody {
            position: relative;
            width: 170px;
            padding: 8px 10px 10px 12px;
            box-sizing: border-box;
            background: rgba(28, 28, 26, .92);
            border-radius: 0 6px 6px 0;
        }

        .roomToolsInfo {
            position: absolute;
            left: 0;
            bottom: calc(100% + 6px);
            width: 100%;
            padding: 8px 10px;
            box-sizing: border-box;
            background: rgba(28, 28, 26, .92);
            border-radius: 0 6px 6px 0;
            color: #fff;

            b {
                display: block;
                font-size: 14px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            span {
                font-size: 12px;
                color: #9a9a96;
            }
        }

        .roomToolsList {
            margin: 0;
            padding: 0;
            list-style: none;

            li {
                display: flex;
                align-items: center;
                gap: 8px;
                height: 29px;
                cursor: pointer;

                &:hover .roomToolsLabel {
                    color: #fff;
                }

                &:hover .roomToolsIcon.settings {
                    background-image: url("@/assets/images/bottom-bar/settings_hover.png");
                }

                &:hover .roomToolsIcon.zoom {
                    background-image: url("@/assets/images/bottom-bar/zoom_hover.png");
                }
            }
        }

        /* the icons of the assets only: no icon, an empty place */
        .roomToolsIcon {
            flex: 0 0 22px;
            height: 22px;
            background: no-repeat center;

            &.settings {
                background-image: url("@/assets/images/bottom-bar/settings.png");
            }

            &.zoom {
                background-image: url("@/assets/images/bottom-bar/zoom.png");
            }
        }

        .roomToolsLabel {
            font-size: 12px;
            color: #b4b4ae;
            text-decoration: underline;
        }

        .roomToolsNavigation {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-top: 8px;
        }

        .roomToolsButton {
            width: 32px;
            height: 30px;
            padding: 0;
            background: #1f2a24 no-repeat center;
            border: 1px solid #0d120f;
            border-radius: 3px;
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .06);
            cursor: pointer;
            outline: none;

            &:hover:not(:disabled) {
                background-color: #2b3a31;
            }

            &:disabled {
                opacity: .45;
                cursor: default;
            }

            &.back,
            &.forward {
                background-size: 6px 8px;
                image-rendering: pixelated;
            }

            &.back {
                background-image: url("@/assets/images/bottom-bar/room_infoIconLeft.png");
            }

            &.forward {
                background-image: url("@/assets/images/bottom-bar/room_infoIconRight.png");
            }

            &.info {
                width: 40px;
                height: 34px;
                background-color: #2f8a6c;
                background-image: url("@/assets/images/bottom-bar/house.png");
                border-color: #0d3326;
                box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .18);

                &:hover {
                    background-color: #36a07d;
                }

                &.active {
                    box-shadow: inset 0 0 0 2px rgba(255, 255, 255, .5);
                }
            }
        }
    }

    #chatBubbleContainer {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        pointer-events: none;

        /* the look of the bubbles (their style): chatBubbles.scss */
        .chatBubble {
            position: absolute;
            width: max-content;
            max-width: 350px;
            user-select: none;
            pointer-events: all !important;
            cursor: pointer !important;

            /* the bubbles slide up, as Nitro: once shown in their place (a new bubble appears there directly) */
            &.placed {
                transition: top 0.2s ease;
            }
        }

        .chatBubbleWhisperTo {
            font-weight: normal;
        }

        .chatColorYellow {
            color: yellow;
        }



    }

    #itemIcon {
        position: fixed;
    }

    .roomObjectsContainer {
        width: 100%;
        height: 100%;

        #roomPointer {
            pointer-events: none;
            display: none;
            position: absolute;
        }

        #roomCanvasContainer {
            position: absolute;
            top:50%;
            left:50%;
            transform: translate(-50%, -50%);

            #floor, #wall, #door, #floorHit, #roomPointer {
                position: absolute;
            }
        }

    }

}

#roomSettingsBox {
    padding: 20px 30px;
    position:absolute;
    left: 20px;
    bottom: 120px;
    background-color: #0b2438;
}
</style>