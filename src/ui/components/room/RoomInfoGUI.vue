<template>
    <Dialog :title="roomName" class-name="roomInfo" :box="UIEventsType.ROOM">
        <div class="roomInfoContainer">
            <div class="roomInfoContainerBg">
                <div class="roomInfoDiv">
                    <div class="roomInfoLabel">Owner</div>
                    <div class="roomInfoValue" id="roomInfoValueOwnerName">{{ owner }}</div>
                    <hr>
                </div>
                <div class="roomInfoDiv">
                    <div class="roomInfoDescription" id="roomInfoValueDescription">{{ description }}</div>
                </div>
                <div class="roomInfoDiv infoCButton">
                    <button id="roomInfoSettingsButton" class="ui-button small" :class="{ hidden: !showSettingButton }">Settings</button>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts" scoped>
import { Ref, ref } from 'vue'
import Dialog from '../dialog/Dialog.vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { EnterRoomUIEventData } from '../../../game/engine/events/ui/data/room/EnterRoomUIEventData'
import { UIEventsType } from '../../../game/engine/events/ui/UIEventsType'

const owner: Ref<string> = ref('')
const description: Ref<string> = ref('')
const roomName: Ref<string> = ref('')
const showSettingButton: Ref<boolean> = ref(false)

EventManager.read(UIEvents.ENTER_ROOM_INFO, (event: EnterRoomUIEventData) => {
    owner.value = event.owner
    description.value = event.description
    roomName.value = event.name
    showSettingButton.value = event.haveRights
})
</script>

<style lang="scss">
.roomInfo {
    pointer-events: all !important;
    position: fixed;
    height: 200px;
    width: 250px;
    background-color: #e9e9e1;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid #000;
    flex-wrap: wrap;
    flex-flow: column;
    left: 20vw;
    top: 20vh;
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
        background-color: #367897;
        height: 30px;
        display: flex;
        flex-flow: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        border-bottom: 1px solid #000;
        font-weight: 700;
        color: #fff;

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

    .roomInfoContainer {
        position: relative;
        margin-top: 0px;
        width: 100%;
        height: calc(100% - 26px);

        .roomInfoContainerBg {
            border-radius: 12px;
            padding: 6px;
            width: 100%;
            height: 100%;

            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            padding: 8px;

            .roomInfoLabel {
                font-weight: 700;
                color: #000;
            }

            .roomInfoValue {
                font-size: small;
            }

            .infoCButton {
                align-self: center;
                justify-content: flex-end;
            }

            .roomInfoDiv {
                flex: 1;
            }
        }
    }
}
</style>