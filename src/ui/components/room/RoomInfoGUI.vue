<template>
    <Dialog :title="roomName" class-name="roomInfo" id="roomEditInfo" :box="UIEventsType.ROOM_INFO">

        <div class="RoomEditInfoContainer">
            <div class="RoomEditInfoContainerBg">
                <div class="roomEditInfoTabs">
                    <div class="tab" :class="{ active: currentTab == 'basic' }" @click="changeTab('basic')">
                        Basic
                    </div>
                    <div class="tab" :class="{ active: currentTab == 'rights' }" @click="changeTab('rights')">
                        Rights
                    </div>
                </div>
                <div class="tabContainer" v-if="currentTab == 'basic'">
                    <ul id="roomInfoEditContainer" class="settingsRoomPanel">
                        <label for="roomeditname">Room Edit Name</label>
                        <input type="text" name="roomeditname" id="roomeditname"
                            placeholder="Room"
                            v-model="roomName">
                        <label for="roomeditdesc">Desc</label>
                        <textarea name="roomeditdesc" id="roomeditdesc"
                            placeholder="Descrizione"
                            cols="40" rows="5" v-model="description"></textarea>

                        <label for="roomeditmaxusers">Max Users</label>
                        <select id="roomeditmaxusers" v-model="roomMaxUsers">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <div>
                            <input type="checkbox" id="roomallowwalkthrough" name="roomallowwalkthrough" value="true"
                                v-model="roomWalkThrough">
                            <label
                                for="roomallowwalkthrough">Allow Walkthrough</label>
                        </div>
                        <div>
                            <button class="deleteButton" @click="saveRoomInfo(true)">Delete Room</button>
                        </div>
                    </ul>
                </div>
                <div class="tabContainer" v-if="currentTab == 'rights'">
                    <select id="roomRightsEditContainer" v-model="rightsSelectUsers">
                        <option :value="rUser.id" v-for="rUser in rightsList" :key="rUser.id">Nome</option>
                    </select>
                    <div id="roomRightsButtons">
                        <div class="ui-button small" id="removeRightsInfoEditButton" @click="saveRights" v-if="rightsSelectUsers != null && rightsSelectUsers">
                            Togli i diritti</div>
                    </div>
                </div>
            </div>
        </div>

    </Dialog>
</template>

<script setup lang="ts" scoped>
import { reactive, Ref, ref } from 'vue'
import Dialog from '../dialog/Dialog.vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { EnterRoomUIEventData } from '../../../game/engine/events/ui/data/room/EnterRoomUIEventData'
import { UIEventsType } from '../../../game/engine/events/ui/UIEventsType'
import { Engine } from '../../../game/Engine'
import { OutgoingPacket } from '../../../game/networking/packets/outgoing/OutgoingPacket'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'

const owner: Ref<string> = ref('')
const description: Ref<string> = ref('')
const roomName: Ref<string> = ref('')
const showSettingButton: Ref<boolean> = ref(false)
const roomMaxUsers = ref(0)
const roomWalkThrough = ref(true)
const rightsList = ref([])
const rightsSelectUsers = ref([])

let currentTab = ref("basic")

EventManager.read(UIEvents.ENTER_ROOM_INFO, (event: EnterRoomUIEventData) => {
    owner.value = event.owner
    description.value = event.description
    roomName.value = event.name
    showSettingButton.value = event.haveRights
})

function changeTab(tab) {
    currentTab.value = tab
}

function saveRights() { 
}

function saveRoomInfo(deleteRoom = false) {
    if (Engine.getInstance().roomService.CurrentRoom == null)
        return;

    let message = {
        id: Engine.getInstance().roomService.CurrentRoom.getRoomId(),
        name: this.roomName,
        desc: this.roomDesc,
        maxUsers: this.roomMaxUsers,
        allowWalk: this.roomWalkThrough,
        deleteRoom: deleteRoom
    }

    Engine.getInstance().networkingManager.packetManager.applyOut(OutgoingPacket.SaveRoomSettingsEvent, message)

    Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.RoomInfoUI).hide()
        

}
</script>

<style lang="scss">
#roomEditInfo {
    position: fixed;
    height: 450px;
    width: 400px;
    background-color: #e9e9e1;
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid #000;
    flex-wrap: wrap;
    flex-flow: column;
    left: 5vw;
    top: 5vh;
    pointer-events: all !important;

    &::after {
        content: " ";
        box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.15);
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
            background: url("/src/assets/images/closeIcon.png") no-repeat;

            &:hover {
                background: url("/src/assets/images/closeIconHover.png") no-repeat;
            }
        }
    }

    .RoomEditInfoContainer {
        position: relative;
        margin-top: 0px;
        width: 100%;
        height: calc(100% - 26px);

        .RoomEditInfoContainerBg {
            width: 100%;
            height: 100%;

            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            padding-left: 4px;
            padding-right: 4px;
            padding-bottom: 4px;

            .roomEditInfoTabs {
                padding-top: 5px;
                padding-left: 16px;
                padding-right: 16px;
                border-bottom: 1px solid #000;

                display: flex;
                width: 100%;

                justify-items: center;
                align-items: center;
                justify-content: left;

                .tab {
                    text-align: center;
                    border-top-left-radius: 4px;
                    border-top-right-radius: 4px;
                    border: 1px solid #000;
                    border-bottom: 0;
                    padding: 3px;
                    color: #000;
                    background-color: #c3c2b8;
                    position: relative;
                    cursor: pointer;
                    user-select: none;

                    &.active {
                        border-left: 2px solid #000;
                        border-right: 2px solid #000;
                        border-top: 2px solid #000;
                        background-color: #eceae0;

                        &::after {
                            content: " ";
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

            .tabContainer {
                padding: 6px;

                display: flex;
                width: 100%;
                height: 100%;

                overflow-y: auto;

                .settingsRoomPanel > label,
                .settingsRoomPanel > input,
                .settingsRoomPanel > select,
                .settingsRoomPanel > textarea {
                    display: block;
                    width: 100%;
                }

                .settingsRoomPanel > label {
                    padding: 2px;
                    margin-bottom: 2px;
                }

                .settingsRoomPanel > input[type="text"],
                .settingsRoomPanel > select,
                .settingsRoomPanel > textarea {
                    height: 25px;
                    border: 1px solid #424242;
                    padding: 4px;
                    border-radius: 4px;
                    margin-bottom: 10px;
                    font-family: "Ubuntu";
                }

                .settingsRoomPanel > select {
                    background-color: #fff;
                }

                .settingsRoomPanel > button {
                    border: 1px solid #424242;
                    padding: 4px;
                    width: 50%;
                    display: inline-block;
                    border-radius: 4px;
                    background-color: #fff;

                    &:hover {
                        background-color: #e0e0e0;
                    }
                }

                .settingsRoomPanel  button.deleteButton {
                    border:none;
                    padding: 4px;
                    width: 100%;
                    display: inline-block;
                    border-radius: 4px;
                    background-color: rgb(207, 11, 11);
                    text-align:center;
                    justify-content: center;
                    margin: 10px auto;
                    color:#fff;
                    cursor:pointer;
                }

                .settingsRoomPanel > textarea {
                    height: 60px;
                    max-height: 60px;
                }

                .settingsRoomPanel {
                    margin: 4px;
                }

                #roomRightsEditContainer {
                    width: 50%;
                }

                #roomRightsButtons {
                    width: 50%;
                    float: right;
                    padding: 2px;
                }
            }
        }
    }
}

</style>