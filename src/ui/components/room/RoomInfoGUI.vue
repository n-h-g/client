<template>
    <Dialog title="Room settings" class-name="roomSettingsDialog" :box="UIEventsType.ROOM_INFO">
        <div class="roomSettings">
            <div class="roomSettingsTabs">
                <div class="roomSettingsTab" :class="{ active: currentTab == 'basic' }" @click="changeTab('basic')">Basic</div>
                <div class="roomSettingsTab" :class="{ active: currentTab == 'access' }" @click="changeTab('access')">Access</div>
                <div class="roomSettingsTab" :class="{ active: currentTab == 'bans' }" @click="changeTab('bans')">Bans</div>
            </div>

            <div class="roomSettingsBody">
                <!-- name, description, users -->
                <template v-if="currentTab == 'basic'">
                    <label class="roomSettingsLabel" for="roomSettingsName">Room name</label>
                    <input id="roomSettingsName" v-model="roomName" class="roomSettingsInput" type="text"
                        :maxlength="MAX_NAME_LENGTH" placeholder="The name of the room" />

                    <label class="roomSettingsLabel" for="roomSettingsDescription">Description</label>
                    <textarea id="roomSettingsDescription" v-model="description" class="roomSettingsInput" rows="4"
                        :maxlength="MAX_DESCRIPTION_LENGTH" placeholder="What is your room about?"></textarea>

                    <label class="roomSettingsLabel" for="roomSettingsMaxUsers">Max users</label>
                    <select id="roomSettingsMaxUsers" v-model.number="maxUsers" class="roomSettingsInput">
                        <option v-for="choice in MAX_USERS_CHOICES" :key="choice" :value="choice">{{ choice }}</option>
                    </select>

                    <div class="roomSettingsDelete">
                        <button v-if="!confirmDelete" class="roomSettingsButton danger" @click="confirmDelete = true">Delete room</button>
                        <template v-else>
                            <span>Delete the room and its furni go back to you?</span>
                            <button class="roomSettingsButton danger" @click="deleteRoom">Yes, delete</button>
                            <button class="roomSettingsButton" @click="confirmDelete = false">No</button>
                        </template>
                    </div>
                </template>

                <!-- who can enter -->
                <template v-else-if="currentTab == 'access'">
                    <div class="roomSettingsLabel">Who can enter the room?</div>
                    <label class="roomSettingsRadio">
                        <input v-model.number="doorMode" type="radio" :value="RoomDoorMode.OPEN" />
                        <span><b>Open</b><br />Everybody can enter.</span>
                    </label>
                    <label class="roomSettingsRadio">
                        <input v-model.number="doorMode" type="radio" :value="RoomDoorMode.DOORBELL" />
                        <span><b>Doorbell</b><br />The users ring and you choose who enters (you must be in the room).</span>
                    </label>
                </template>

                <!-- the banned users -->
                <template v-else>
                    <div class="roomSettingsLabel">Banned users</div>
                    <div class="roomSettingsBans">
                        <div v-for="ban in bans" :key="ban.userId" class="roomSettingsBan">
                            <span class="roomSettingsBanName">{{ ban.username }}</span>
                            <span class="roomSettingsBanUntil">{{ banUntil(ban) }}</span>
                            <button class="roomSettingsButton small" @click="unban(ban.userId)">Unban</button>
                        </div>
                        <div v-if="bans.length === 0" class="roomSettingsEmpty">
                            {{ bansLoaded ? "Nobody is banned from this room." : "Loading..." }}
                        </div>
                    </div>
                </template>
            </div>

            <div v-if="currentTab != 'bans'" class="roomSettingsFooter">
                <button class="roomSettingsButton" @click="hide">Cancel</button>
                <button class="roomSettingsButton primary" :disabled="!roomName.trim()" @click="save">Save</button>
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import Dialog from '../dialog/Dialog.vue'
import { EventManager } from '../../../game/core/events/EventManager'
import { UIEvents } from '../../../game/engine/events/ui/UIEvents'
import { EnterRoomUIEventData } from '../../../game/engine/events/ui/data/room/EnterRoomUIEventData'
import { RoomBan, RoomBansData } from '../../../game/engine/events/ui/data/room/RoomBansData'
import { UIEventsType } from '../../../game/engine/events/ui/UIEventsType'
import { Engine } from '../../../game/Engine'
import { OutgoingPacket } from '../../../game/networking/packets/outgoing/OutgoingPacket'
import { IComponentShowableUI } from '../../../game/core/ui/IComponentShowableUI'
import { UIComponent } from '../../../game/engine/ui/components/UIComponent'
import { RoomDoorMode } from '../../../game/engine/room/RoomInfo'

/** As the server (SaveRoomSettings, Room.MAX_USERS_CHOICES). */
const MAX_NAME_LENGTH = 60
const MAX_DESCRIPTION_LENGTH = 255
const MAX_USERS_CHOICES = [10, 25, 50, 100]

type Tab = 'basic' | 'access' | 'bans'

const currentTab = ref<Tab>('basic')
const roomName = ref('')
const description = ref('')
const maxUsers = ref(25)
const doorMode = ref<number>(RoomDoorMode.OPEN)
const confirmDelete = ref(false)

const bans = ref<RoomBan[]>([])
const bansLoaded = ref(false)

/*
 * The values of the room: the component is mounted when the window opens (after the room was entered), so they
 * are read from the room, and again when the server sends the room (e.g. saved from here).
 */
function fill(info: { name: string, description?: string, maxUsers?: number, doorMode?: number }) {
    roomName.value = info.name ?? ''
    description.value = info.description ?? ''
    maxUsers.value = MAX_USERS_CHOICES.includes(info.maxUsers ?? 0) ? info.maxUsers! : 25
    doorMode.value = info.doorMode ?? RoomDoorMode.OPEN
}

const roomInfo = Engine.getInstance()?.roomService?.currentRoom?.roomInfo
if (roomInfo) {
    fill({ name: roomInfo.roomName, description: roomInfo.description, maxUsers: roomInfo.maxUsers, doorMode: roomInfo.doorMode })
}

function onRoomInfo(event: EnterRoomUIEventData) {
    fill(event)
}

function onBans(event: RoomBansData) {
    bans.value = event.bans
    bansLoaded.value = true
}

EventManager.read(UIEvents.ENTER_ROOM_INFO, onRoomInfo)
EventManager.read(UIEvents.ROOM_BANS, onBans)
onUnmounted(() => {
    EventManager.off(UIEvents.ENTER_ROOM_INFO, onRoomInfo)
    EventManager.off(UIEvents.ROOM_BANS, onBans)
})

function send(packet: OutgoingPacket, data?: object) {
    Engine.getInstance()?.networkingManager?.packetManager.applyOut(packet, data)
}

function changeTab(tab: Tab) {
    currentTab.value = tab
    confirmDelete.value = false

    if (tab === 'bans') send(OutgoingPacket.RequestRoomBansEvent)
}

function hide() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager.getComponent<IComponentShowableUI>(UIComponent.RoomInfoUI)?.hide()
}

function save() {
    const room = Engine.getInstance()?.roomService?.currentRoom
    if (!room || !roomName.value.trim()) return

    send(OutgoingPacket.SaveRoomSettingsEvent, {
        id: room.id,
        name: roomName.value.trim(),
        description: description.value.trim(),
        maxUsers: maxUsers.value,
        doorMode: doorMode.value,
        deleteRoom: false,
    })
    hide()
}

function deleteRoom() {
    const room = Engine.getInstance()?.roomService?.currentRoom
    if (!room) return

    send(OutgoingPacket.SaveRoomSettingsEvent, { id: room.id, deleteRoom: true })
    hide()
}

function unban(userId: number) {
    send(OutgoingPacket.RoomUnbanEvent, { userId })
}

function banUntil(ban: RoomBan): string {
    if (!ban.expiresAt) return 'Forever'

    const date = new Date(ban.expiresAt)
    if (isNaN(date.getTime())) return ''

    return 'Until ' + date.toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style lang="scss">
#dialog.roomSettingsDialog {
    position: fixed;
    z-index: 2;
    top: 8vh;
    left: 5vw;
    width: 360px;
    height: 430px;
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 70px);

    > .content {
        padding: 8px 10px 10px;
        box-sizing: border-box;
    }
}

.roomSettings {
    height: 100%;
    display: flex;
    flex-direction: column;
    font-size: 12px;
    color: #000;

    .roomSettingsTabs {
        flex: 0 0 auto;
        display: flex;
        gap: 2px;
        border-bottom: 1px solid #8f8f8f;
    }

    .roomSettingsTab {
        padding: 5px 14px;
        font-size: 13px;
        background: linear-gradient(#e8e8e8, #c9c9c9);
        border: 1px solid #8f8f8f;
        border-bottom: none;
        border-radius: 6px 6px 0 0;
        cursor: pointer;
        user-select: none;

        &.active {
            background: #fff;
            margin-bottom: -1px;
            padding-bottom: 6px;
        }
    }

    .roomSettingsBody {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 10px 2px 4px;
    }

    .roomSettingsLabel {
        margin-top: 6px;
        font-weight: 700;

        &:first-child {
            margin-top: 0;
        }
    }

    .roomSettingsInput {
        width: 100%;
        box-sizing: border-box;
        padding: 5px 7px;
        border: 1px solid #8f8f8f;
        border-radius: 4px;
        background: #fff;
        font-family: inherit;
        font-size: 12px;
        outline: none;
        resize: none;

        &:focus {
            border-color: #367897;
        }
    }

    .roomSettingsRadio {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px;
        background: #fff;
        border-radius: 4px;
        line-height: 1.4;
        cursor: pointer;

        input {
            margin-top: 2px;
            accent-color: #367897;
        }
    }

    .roomSettingsDelete {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        margin-top: auto;
        padding-top: 12px;

        span {
            flex: 1 0 100%;
        }
    }

    .roomSettingsBans {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }

    .roomSettingsBan {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 4px 4px 8px;
        background: #fff;
        border-radius: 4px;
    }

    .roomSettingsBanName {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 700;
    }

    .roomSettingsBanUntil {
        color: #777;
        font-size: 11px;
    }

    .roomSettingsEmpty {
        padding: 6px 2px;
        font-style: italic;
        color: #888;
    }

    .roomSettingsFooter {
        flex: 0 0 auto;
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        padding-top: 8px;
        border-top: 1px solid #c9c9c1;
    }

    .roomSettingsButton {
        padding: 5px 14px;
        background: linear-gradient(#fff, #e3e3e3);
        border: 1px solid #000;
        border-radius: 5px;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        color: #000;
        cursor: pointer;
        outline: none;

        &.small {
            padding: 2px 10px;
            font-size: 11px;
        }

        &.primary {
            background: linear-gradient(#3fbf3a, #2aa52a);
            border-color: #0d4d12;
            color: #fff;
            text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
        }

        &.danger {
            background: linear-gradient(#e85a52, #c9302c);
            border-color: #6b1410;
            color: #fff;
            text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3);
        }

        &:hover {
            filter: brightness(1.06);
        }

        &:disabled {
            filter: grayscale(0.8) opacity(0.6);
            cursor: default;
        }
    }
}
</style>
