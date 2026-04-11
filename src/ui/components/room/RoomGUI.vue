<template>
    <div id="roomGui" ref="roomGui"> 
        <div id="chatBubbleContainer" ref="chatBubbleContainer">
            <div class="chatBubble" 
                v-for="message in messages" 
                :key="message.internalId" 
                :id="message.internalId" 
                :style="{top: message.y + 'px', left: message.x + 'px'}" 
                :class="{'chatBubbleShout': message.data.shout}"
                @click="onClickChat(message)">
                
                <div class="chatBubbleContainer">
                    <div class="playerHeadContainer">
                        <img src="" />
                    </div>
                    <p>
                        <b>{{ message.data.author.name }}:</b> {{ message.data.text }}
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
import { ref, onMounted, onUnmounted } from 'vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { Engine } from '../../../game/Engine'
import { RoomChatData } from '../../../game/engine/events/ui/data/room/RoomChatData'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import { AvatarData } from '../../../game/engine/ui/imagers/avatars/enum/AvatarData'
import { UiUtils } from '../../../game/utils/UiUtils'
import { Container } from 'pixi.js'

interface UIChatBubble {
    data: RoomChatData;
    yOffset: number;
    targetYOffset: number; // NUOVO: Dove la bolla deve arrivare
    createdAt: number;
    internalId: string;
    x: number;
    y: number;
}

const chatMessageDefaultHeight = 32;
const chatLifespan = 8000;
let chatMessageCounter = 0; 

let messages = ref<UIChatBubble[]>([])
let animationFrameId: number;

function onClickChat(message: any) {
    if(!message.data.author) return;
    message.data.author.logic.onClick()
}

// 1. GESTIONE ARRIVO NUOVO MESSAGGIO
EventManager.read(UIEvents.ROOM_NEW_MESSAGE, (rawEvent: RoomChatData) => {
    // Sposta il BERSAGLIO verso l'alto (non la posizione attuale)
    messages.value.forEach(msg => {
        msg.targetYOffset += chatMessageDefaultHeight;
    });

    let startX = -1000;
    let startY = -1000;

    if (rawEvent.author?.visualization?.container) {
        const container = rawEvent.author.visualization.container as Container;
        const globalPos = UiUtils.getGlobalPosition(container);
        startX = globalPos.tx + AvatarData.AVATAR_LEFT_OFFSET;
        startY = globalPos.ty - container.height - 15;
    }

    messages.value.push({
        data: rawEvent,
        yOffset: 0,
        targetYOffset: 0, // Parte da zero e va verso zero
        createdAt: Date.now(),
        internalId: `chat_msg_${Date.now()}_${chatMessageCounter++}`,
        x: startX,
        y: startY
    });
})

// 2. LOOP DELLA UI (FISICA E RENDER)
function updateChatPositions() {
    const now = Date.now();

    messages.value = messages.value.filter(msg => {
        const isExpired = (now - msg.createdAt) > chatLifespan;
        const hasAuthorContainer = msg.data.author && msg.data.author.visualization?.container;
        return !isExpired && hasAuthorContainer;
    });

    for (let i = 0; i < messages.value.length; i++) {
        const chatMessage = messages.value[i];
        
        // --- INIZIO LOGICA ANIMAZIONE (LERP) ---
        // Se l'offset attuale è minore del bersaglio, scivola verso l'alto
        if (chatMessage.yOffset < chatMessage.targetYOffset) {
            // Modifica lo 0.15 per rendere l'animazione più veloce o più lenta
            chatMessage.yOffset += (chatMessage.targetYOffset - chatMessage.yOffset) * 0.15;
            
            // Arrotonda per evitare calcoli infiniti microscopici
            if (Math.abs(chatMessage.targetYOffset - chatMessage.yOffset) < 0.5) {
                chatMessage.yOffset = chatMessage.targetYOffset;
            }
        }
        // --- FINE LOGICA ANIMAZIONE ---

        if (!chatMessage.data.author?.visualization?.container) continue;
        const container = chatMessage.data.author.visualization.container as Container;
        if (!container.visible) continue;

        const globalPos = UiUtils.getGlobalPosition(container);
        
        chatMessage.x = globalPos.tx + AvatarData.AVATAR_LEFT_OFFSET;
        
        const baseHeadY = globalPos.ty - container.height - 15;
        // Applica l'offset calcolato dall'animazione
        chatMessage.y = baseHeadY - chatMessage.yOffset; 
    }

    animationFrameId = requestAnimationFrame(updateChatPositions);
}

onMounted(() => {
    animationFrameId = requestAnimationFrame(updateChatPositions);
})

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
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
            //transition: top 0.4s ease-out;
            pointer-events: all !important;
            cursor:pointer !important;
            transform: translateX(-50%);
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