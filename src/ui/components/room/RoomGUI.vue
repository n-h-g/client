<template>
    <div id="roomGui" ref="roomGui"> 
        <!-- the chat strip at the top of the room, as Habbo/Nitro: the bubbles are born on its bottom line -->
        <div id="chatBubbleContainer" ref="chatBubbleContainer" :style="{ height: chatHeight + 'px' }">
            <div class="chatBubble"
                v-for="message in messages"
                :key="message.internalId"
                :ref="element => setBubbleElement(message, element as HTMLElement | null)"
                :style="{ top: message.top + 'px', left: message.left + 'px', visibility: message.ready ? 'visible' : 'hidden' }"
                :class="{ chatBubbleShout: message.data.shout, chatBubbleWhisper: message.data.whisper }"
                @click="onClickChat(message)">
                <div class="chatBubbleHead">
                    <img v-if="message.head" :src="message.head" @load="onHeadLoad" />
                </div>
                <div class="chatBubbleContent">
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
        <div class="roomPanel" ref="roomPanel">
            <div class="arrowLeft"></div>
            <b>{{ getRoomName() }}</b>
            <p>by {{ getAuthorName() }}</p>
            <ul class="buttons-list">
                <li class="settings" @click="openSettings()"></li>
            </ul>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { Engine } from '../../../game/Engine'
import { RoomChatData } from '../../../game/engine/events/ui/data/room/RoomChatData'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import { AvatarHeadImage } from '../../../game/engine/ui/imagers/avatars/AvatarHeadImage'
import { Container } from 'pixi.js'

/**
 * The room chat as Nitro's ChatWidgetView (free flow mode): a bubble is born on the bottom line of the
 * chat strip, centered on the avatar that talks, and then it stays there (it doesn't follow the avatar).
 * Every few seconds all the bubbles go up; a new bubble pushes up the older ones it overlaps.
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
    head: string;
}

/** Part of the window height used by the chat strip (Nitro's chat.viewer.height.percentage). */
const CHAT_HEIGHT_PERCENTAGE = 0.4
/** Nitro's normal scroll speed: the bubbles go up by MOVE_AMOUNT every SCROLL_SPEED ms. */
const SCROLL_SPEED = 6000
const MOVE_AMOUNT = 15
/** Space between the head of the avatar and a bubble born over it. */
const CHAT_HEAD_MARGIN = 8

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
    const headTop = avatarScreenTop(data)
    bubble.top = chatHeight.value - bubble.height
    if (headTop != null) bubble.top = Math.min(bubble.top, headTop - bubble.height - CHAT_HEAD_MARGIN)

    makeRoom(bubble)
    bubble.ready = true
})

/** Nitro's DoChatsOverlap: b is moved by additionalBTop. */
function chatsOverlap(a: UIChatBubble, b: UIChatBubble, additionalBTop: number): boolean {
    return !((a.left + a.width) < b.left
        || a.left > (b.left + b.width)
        || (a.top + a.height) < (b.top + additionalBTop)
        || a.top > (b.top + additionalBTop + b.height))
}

/** Pushes up the older bubbles that the bubble overlaps (and the ones they overlap in turn). */
function checkOverlappingChats(chat: UIChatBubble, moved: number, pushed: UIChatBubble[]) {
    const list = messages.value

    for (let i = list.indexOf(chat) - 1; i >= 0; i--) {
        const collides = list[i]

        if (!collides.ready || collides === chat || pushed.includes(collides)
            || ((collides.top + collides.height) - moved) > (chat.top + chat.height)) continue

        if (chatsOverlap(chat, collides, -moved)) {
            const amount = Math.abs((collides.top + collides.height) - chat.top)

            pushed.push(collides)
            collides.top -= amount
            collides.skipMovement = true

            checkOverlappingChats(collides, amount, pushed)
        }
    }
}

function makeRoom(chat: UIChatBubble) {
    chat.skipMovement = true
    checkOverlappingChats(chat, 0, [chat])
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

function getRoomName() {
    return Engine.getInstance().roomService.currentRoom?.roomInfo.roomName || 'Unknown'
}

function getAuthorName() {
    return Engine.getInstance().roomService.currentRoom?.roomInfo.authorName || 'Unknown'
}
</script>


<style lang="scss">
#roomGui {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 10000;

    .roomPanel {
        background-color: #2e2e2c;
        border: 2px solid #53524f;
        min-height: 50px;
        position:fixed;
        left:0;
        bottom:90px;
        padding: 10px;
        line-height: 5px;

        b {
            color: #fff;
        }
        p {
            color: #fff;
            opacity: 0.3;
        }

        .buttons-list {
            list-style-type: none;

            li {
                background-image: url("@/assets/images/bottom-bar/settings.png");
                height: 20px;
                width: 20px;
                border: 2px solid #53524f;
                border-radius: 5px;
                pointer-events: all;
                cursor: pointer;
            }
        }

    }

    #chatBubbleContainer {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        pointer-events: none;

        .chatBubble {
            position: absolute;
            display: flex;
            flex-direction: row;
            width: max-content;
            max-width: 350px;
            min-height: 26px;
            box-sizing: border-box;
            border: 1px solid #000;
            border-radius: 7px;
            background: linear-gradient(180deg, #fff 0%, #ebebeb 50%, #fff 100%);
            font-size: 14px;
            line-height: 1.15;
            word-break: break-word;
            user-select: none;
            pointer-events: all !important;
            cursor: pointer !important;
            /* the bubbles slide up, as Nitro */
            transition: top 0.2s ease;

            .chatBubbleHead {
                position: relative;
                flex: none;
                width: 27px;
                border-radius: 6px 0 0 6px;
                background-color: #c8c8c8;
                border-right: 1px solid #8e8e8e;

                img {
                    position: absolute;
                    left: 50%;
                    bottom: 2px;
                    transform: translateX(-50%);
                }
            }

            .chatBubbleContent {
                padding: 5px 6px 5px 4px;
                color: #000;
            }

            /* points to the avatar that talked */
            .chatBubblePointer {
                position: absolute;
                left: 50%;
                bottom: -6px;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid #000;

                &::after {
                    content: "";
                    position: absolute;
                    left: -4px;
                    top: -7px;
                    border-left: 4px solid transparent;
                    border-right: 4px solid transparent;
                    border-top: 5px solid #fff;
                }
            }
        }

        /* a whisper, as Habbo: grey and italic */
        .chatBubble.chatBubbleWhisper {
            background: linear-gradient(180deg, #f2f2f2 0%, #dedede 50%, #f2f2f2 100%);

            .chatBubbleContent {
                color: #636363;
                font-style: italic;
            }

            .chatBubbleWhisperTo {
                font-weight: normal;
            }
        }
        .chatBubbleShout {
            font-weight: bold; 
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