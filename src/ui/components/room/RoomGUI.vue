<template>
    <div id="roomGui" ref="roomGui"> 
        <div id="chatBubbleContainer" ref="chatBubbleContainer">
            <div class="chatBubble" v-for="message in messages" :key="message.id" :id="message.id" :style="{top: message.y + 'px', left: message.x + 'px'}" v-bind:class="message.shout ? 'chatBubbleShout' : ''" @click=onClickChat(message)>
                <div class="chatBubbleContainer">
                <div class="playerHeadContainer">
                    <img src="" />
                    </div>
                    <p>
                        <b>{{ message.author.name }}:</b> {{ message.text }}
                    </p>
                 </div>
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
import anime from 'animejs'
import { ref } from 'vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { Engine } from '../../../game/Engine'
import { RoomChatData } from '../../../game/engine/events/ui/data/room/RoomChatData'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { ChatData } from '../../../game/engine/game/chat/ChatData'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import {AvatarData} from '../../../game/engine/ui/imagers/avatars/enum/AvatarData'
import {UiUtils} from '../../../game/utils/UiUtils'
import { Container } from 'pixi.js'

const chatDelayTimer = 2000 // in ms

const chatMessageDefaultHeight = 28

let messages = ref([] as RoomChatData[])

function pushChatMessageUp(additionalPaddingTop: number = 0) {
    anime({
        targets: ".chatBubble",
        top: "-=" + additionalPaddingTop,
        easing: 'easeInQuad',
        duration: Engine.getInstance().config.fps / 60
    });
}

function onClickChat(message) {
    if(!message.author) return;
    message.author.logic.onClick()
}

function checkChatCollision(a, b, extraPadding: number = 0, padding: number = 0) {
    return !((((a.x + padding) + a.width) < (b.x + padding)) || ((a.x + padding) > ((b.x + padding) + b.width)) || ((a.y + a.height) < (b.y + extraPadding)) || (a.y > ((b.y + extraPadding) + b.height)));
}

EventManager.read(UIEvents.ROOM_UPDATE_CHAT, (event: RoomChatData) => {
    for(let i = 0; i < messages.value.length; i++) {
        const elements: HTMLCollection = document.getElementsByClassName("chatBubble");

        const chatMessage = messages.value[i]

        if(!chatMessage) continue;

        if(!((chatMessage.author.visualization.container as Container).visible)) return;

        chatMessage.x = UiUtils.getGlobalPosition((chatMessage.author.visualization.container as Container)).tx + AvatarData.AVATAR_LEFT_OFFSET
        chatMessage.y = UiUtils.getGlobalPosition((chatMessage.author.visualization.container as Container)).ty - (chatMessage.author.visualization.container.height * 2) + 28 * i
    }
})

EventManager.read(UIEvents.ROOM_NEW_MESSAGE, (event: RoomChatData) => {

    if(messages.value.length != 0) {

        //event.y += 28 * messages.value[messages.value.length - 1].y

        pushChatMessageUp(chatMessageDefaultHeight)
    } 

    messages.value.push(event)

    setTimeout(() => {
        initializeChatInterval()
    }, chatDelayTimer)
})

function initializeChatInterval() {

    let additionalPaddingTop = 0

    setInterval(() => {

    for(let i = 1; i < messages.value.length; i++) {

        let previousChat = messages.value[i - 1];

        let currentChat = messages.value[i]

        if(!currentChat) { currentChat = previousChat}

        let skipAnimation: boolean = false

        const elements: HTMLCollection = document.getElementsByClassName("chatBubble");

        const previousElement = elements[i - 1] as HTMLElement
        const currentElement = elements[i] as HTMLElement

        additionalPaddingTop = currentChat != previousChat ? 28 : previousChat.height + 28

        if(previousElement && currentElement) {
            previousChat.height = parseInt(previousElement.style.height)
            currentChat.height = parseInt(currentElement.style.height)

            previousChat.width = parseInt(previousElement.style.width)
            currentChat.width = parseInt(currentElement.style.width)

            if(checkChatCollision(previousChat, currentChat)) {
                skipAnimation = true
            }
        }

        if (!checkVisible(previousElement)) {
            previousElement.remove()
            delete messages[i]
        }
    }

    pushChatMessageUp(additionalPaddingTop)
    }, 5000)

}

function checkVisible(elm: HTMLElement | null) {
    const rect = elm?.getBoundingClientRect();
    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);

    if(!rect) return;

    return !(rect!.bottom < 0 || rect!.top - viewHeight >= 0);
}

function openSettings() {
    Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.RoomInfoUI).toggle()
}

function getRoomName() {
    return Engine.getInstance().roomService.CurrentRoom.getRoomInfo().roomName
}
function getAuthorName() {
    return Engine.getInstance().roomService.CurrentRoom.getRoomInfo().authorName
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
        bottom: 0;

        .chatBubble {
            height: 28px;
            position: absolute;
            border: 1px solid #000;
            border-radius: 7px;
            max-width: 80vw;
          //  word-break: break-all; // todo check problem with many devices
            background:linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(235,235,235,1) 50%, rgba(255,255,255,1) 100%);
            display: flex;
            flex-direction: row;
            overflow: hidden;
            line-height: 2px;
            transition: top 0.4s ease-out;
            pointer-events: all !important;
            cursor:pointer !important;
            //border-image-source: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADMAAAAYCAYAAABXysXfAAAACXBIWXMAAAsSAAALEgHS3X78AAAAsklEQVR42u3YwQ2AIAwFUNZwC48M5B6sxw4MUyGRRKDh1N9gheQnHjzwJK0pjohcn7xo9bD75hDcixLJK6SUSCLcXhvI83whUiAkvCqqwaAhKEwP6jEeFRUMUyOfwTA1hCv49weSLP5JQ9iY/2IKxATmgRASooLRgsAxmhDNkwkmMLWLaYC0upk30832T3Nj3DCYfRIzzDM5pwnMGwTKUTAxRpLOMDYztzLLg6YXGhaumm6fs9SOmEzL3AAAAABJRU5ErkJggg==);

            .chatBubbleContainer {
                height: 100%;
                display: flex;
                flex-direction: row;
                
                b {
                    font-size: 14px;
                }
                p {
                    font-size: 14px;
                    flex: 2;
                }

                .playerHeadContainer 
                {
                    background-color: #bdbdbd;
                    width: 23px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-right: 2px solid #585858;
                    padding: 3px 4px;
                    margin-right: 3px;

                    img {
                        position: absolute;
                        left: -2px;
                        top: -6px;
                    }
                }
            }
        }

        .chatBubbleWhisper {
            color: #636363;
            font-style: italic;
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