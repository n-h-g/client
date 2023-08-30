<template>
    <div id="roomGui" ref="roomGui">
        <div id="chatBubbleContainer" ref="chatBubbleContainer">
            <div class="chatBubble" v-for="message in messages" :key="message.id" :id="message.id" :style="{top: message.y + 'px', left: message.x + 'px'}" v-bind:class="message.shout ? 'chatBubbleShout' : ''">
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
import { ref } from 'vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { Engine } from '../../../game/Engine'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'

let messages = ref([])

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
            position: absolute;
            border: 1px solid #000;
            border-radius: 7px;
            max-width: 80vw;
          //  word-break: break-all; // todo check problem with many devices
            background:linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(235,235,235,1) 50%, rgba(255,255,255,1) 100%);
            display: flex;
            flex-direction: row;
            overflow: hidden;
            line-height: 22px;
            transition: top 0.4s ease-out;
            pointer-events: all !important;
            cursor:pointer !important;

            .chatBubbleContainer {
                height: 100%;
                display: flex;
                flex-direction: row;

                p {
                    flex: 2;
                }

                .playerHeadContainer 
                {
                    background-color: #bdbdbd;
                    width: 28px;
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