<template>
    <div
        v-if="visible"
        ref="menu"
        class="avatar-context-menu"
        :class="{ 'opens-below': opensBelow }"
        :style="menuStyle"
        @pointerdown.stop
        @click.stop
    >
        <div class="avatar-menu-title">{{ avatar.name }}</div>

        <template v-if="!collapsed">
            <template v-if="avatar.isSelf">
                <template v-if="menuView === 'main'">
                    <button class="avatar-menu-row menu-link" @click="changeLook">My Look</button>
                    <button class="avatar-menu-row menu-row-arrow" @click="setMenuView('dance')">Dance</button>
                    <button class="avatar-menu-row menu-row-arrow" @click="setMenuView('actions')">Actions</button>
                    <button class="avatar-menu-row menu-row-arrow" @click="setMenuView('signs')">Signs</button>
                    <button v-if="avatar.isRiding" class="avatar-menu-row" @click="ridePet(false)">Dismount</button>
                </template>
                <template v-else-if="menuView === 'dance'">
                    <button class="avatar-menu-row" @click="runAction('dance', 1)">Pogo Mogo</button>
                    <button class="avatar-menu-row" @click="runAction('dance', 2)">Duck Funk</button>
                    <button class="avatar-menu-row" @click="runAction('dance', 3)">The Rollie</button>
                    <button class="avatar-menu-row" @click="runAction('dance', 4)">Hab-Hop</button>
                    <button class="avatar-menu-row menu-back" @click="setMenuView('main')">Back</button>
                </template>
                <template v-else-if="menuView === 'actions'">
                    <button class="avatar-menu-row" @click="runAction('sit')">{{ avatar.sitting ? 'Stand' : 'Sit' }}</button>
                    <button class="avatar-menu-row" @click="runAction('wave')">Wave</button>
                    <button class="avatar-menu-row" @click="runAction('laugh')">Laugh</button>
                    <button class="avatar-menu-row" @click="runAction('blow')">Blow a kiss</button>
                    <button class="avatar-menu-row" @click="runAction('sleep')">Idle</button>
                    <button class="avatar-menu-row menu-back" @click="setMenuView('main')">Back</button>
                </template>
                <template v-else>
                    <div class="avatar-menu-signs">
                        <button v-for="number in signNumbers" :key="number" class="sign-card" @click="runAction('sign', 1, number)">{{ number }}</button>
                    </div>
                    <button class="avatar-menu-row menu-back" @click="setMenuView('main')">Back</button>
                </template>
            </template>
            <!-- a pet (as Habbo): a horse can be ridden -->
            <template v-else-if="avatar.isPet">
                <button class="avatar-menu-row" :class="{ unavailable: petRespects <= 0 }" :disabled="petRespects <= 0"
                    :title="petRespects <= 0 ? 'No more scratches today' : 'Scratches left today'" @click="scratchPet">Pet ({{ petRespects }})</button>
                <button v-if="avatar.isRiding" class="avatar-menu-row" @click="ridePet(false)">Dismount</button>
                <button v-else-if="avatar.canRide" class="avatar-menu-row" @click="ridePet(true)">Ride</button>
                <button v-if="avatar.isPetOwner" class="avatar-menu-row" @click="comingSoon('Train')">Train</button>
                <button v-if="avatar.canPickUp" class="avatar-menu-row" @click="pickUpBot">Pick up</button>
            </template>
            <template v-else-if="avatar.isBot">
                <button v-if="avatar.canPickUp" class="avatar-menu-row" @click="pickUpBot">Pick up</button>
                <div v-else class="avatar-menu-row unavailable">Bot</div>
            </template>
            <template v-else-if="menuView === 'moderate'">
                <button class="avatar-menu-row" @click="kick">Kick</button>
                <button class="avatar-menu-row menu-row-arrow" @click="setMenuView('ban')">Ban</button>
                <button class="avatar-menu-row menu-back" @click="setMenuView('main')">Back</button>
            </template>
            <template v-else-if="menuView === 'ban'">
                <button class="avatar-menu-row" @click="ban('hour')">For an hour</button>
                <button class="avatar-menu-row" @click="ban('day')">For a day</button>
                <button class="avatar-menu-row" @click="ban('permanent')">Permanent</button>
                <button class="avatar-menu-row menu-back" @click="setMenuView('moderate')">Back</button>
            </template>
            <template v-else>
                <template v-if="avatar.userId != null && !friendship.isFriend">
                    <button v-if="friendship.hasRequestFrom" class="avatar-menu-row" @click="acceptFriend">Accept friend</button>
                    <button v-else-if="friendship.hasSent" class="avatar-menu-row unavailable" disabled>Request sent</button>
                    <button v-else class="avatar-menu-row" @click="addFriend">Ask to be a Friend</button>
                </template>
                <button class="avatar-menu-row unavailable" disabled>Trade</button>
                <button v-if="avatar.userId != null" class="avatar-menu-row" @click="whisper">Whisper</button>
                <button class="avatar-menu-row unavailable" disabled>Give a gem</button>
                <button class="avatar-menu-row unavailable" disabled>Ignore</button>
                <button class="avatar-menu-row unavailable" disabled>Report</button>
                <button v-if="avatar.canModerate" class="avatar-menu-row menu-row-arrow" @click="setMenuView('moderate')">Moderate</button>
                <button v-else class="avatar-menu-row unavailable" disabled>Moderate</button>
            </template>
        </template>

        <!-- as Habbo: the menu shrinks to the name, and opens again -->
        <button class="avatar-menu-toggle" :class="{ collapsed }" :title="collapsed ? 'Open' : 'Close'" @click="toggleCollapsed"></button>
        <div class="avatar-menu-arrow"></div>
    </div>
</template>

<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {EventManager} from '../../../game/core/events/EventManager'
import {HumanVisualization} from '../../../game/core/room/object/human/visualization/HumanVisualization'
import {Engine} from '../../../game/Engine'
import {AvatarContextMenuData} from '../../../game/engine/events/ui/data/avatar/AvatarContextMenuData'
import {UIEvents} from '../../../game/engine/events/ui/UIEvents'
import {ActionId} from '../../../game/engine/ui/imagers/avatars/enum/actions/ActionId'
import {UIComponent} from '../../../game/engine/ui/components/UIComponent'
import {IComponentShowableUI} from '../../../game/core/ui/IComponentShowableUI'
import {OutgoingPacket} from '../../../game/networking/packets/outgoing/OutgoingPacket'
import {FriendsStore} from '../../../game/engine/friends/FriendsStore'
import {WhisperData} from '../../../game/engine/events/ui/data/room/WhisperData'
import {PetRespects} from '../../../game/engine/room/objects/pets/PetRespects'
import {BubbleAlertData} from '../../../game/engine/events/ui/data/general/BubbleAlertData'

const visible = ref(false)
const menu = ref<HTMLElement | null>(null)
const avatar = ref<AvatarContextMenuData>({id: '', name: '', x: 0, y: 0, sitting: false, isSelf: false})
const left = ref(0)
const top = ref(0)
const arrowLeft = ref(58)
const opensBelow = ref(false)
const menuView = ref<'main' | 'dance' | 'actions' | 'signs' | 'moderate' | 'ban'>('main')
const collapsed = ref(false)
const signNumbers = Array.from({length: 10}, (_, index) => index + 1)

// the friendship with the user of the avatar, updated when the friend list changes (e.g. request sent)
const friendsVersion = ref(0)
FriendsStore.getInstance().subscribe(() => friendsVersion.value++)

const friendship = computed(() => {
    friendsVersion.value
    const store = FriendsStore.getInstance()
    const userId = avatar.value.userId

    return {
        isFriend: store.isFriend(userId),
        hasSent: store.hasSentRequest(userId),
        hasRequestFrom: store.hasRequestFrom(userId),
    }
})

function addFriend() {
    if (avatar.value.userId == null) return
    FriendsStore.getInstance().sendRequest({userId: avatar.value.userId})
    close()
}

/** The bot (or the pet) goes back to the inventory of its owner. */
function pickUpBot() {
    const packet = avatar.value.isPet ? OutgoingPacket.PickupPetEvent : OutgoingPacket.PickupBotEvent
    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(packet, {id: avatar.value.id})
    close()
}

// ---------------- pets
const petRespects = ref(PetRespects.left)

/** "Ride": the user walks next to the horse and gets on it; "Dismount": it gets off (the server decides). */
function ridePet(ride: boolean) {
    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RidePetEvent, {
        id: avatar.value.id,
        ride,
    })
    close()
}

/** "Pet": a scratch (the server counts them, PetScratched makes it smile). */
function scratchPet() {
    if (petRespects.value <= 0) return

    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.ScratchPetEvent, {id: avatar.value.id})
    // until the server answers (PetRespectsLeft)
    PetRespects.left = petRespects.value - 1
    close()
}

function comingSoon(feature: string) {
    EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, {message: `${feature}: coming soon!`})
    close()
}

/** The chat bar whispers to the user (see ChatBar). */
function whisper() {
    EventManager.emit<WhisperData>(UIEvents.CHAT_WHISPER, {username: avatar.value.name})
    close()
}

function acceptFriend() {
    if (avatar.value.userId == null) return
    FriendsStore.getInstance().acceptRequest(avatar.value.userId)
    close()
}
let ignoreOutsideUntil = 0

const menuStyle = computed(() => ({
    left: `${left.value}px`,
    top: `${top.value}px`,
    '--avatar-menu-arrow-left': `${arrowLeft.value}px`,
}))

function placeMenu() {
    const bounds = menu.value?.getBoundingClientRect()
    if (!bounds) return

    const margin = 8
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const width = bounds.width
    const height = bounds.height
    left.value = Math.max(margin, Math.min(avatar.value.x - width / 2, viewportWidth - width - margin))
    arrowLeft.value = Math.max(18, Math.min(avatar.value.x - left.value, width - 18))

    const above = avatar.value.y - height - 14
    opensBelow.value = above < margin
    top.value = opensBelow.value
        ? Math.min(avatar.value.y + 14, viewportHeight - height - margin)
        : above
}

EventManager.read(UIEvents.AVATAR_CONTEXT_MENU, (payload: AvatarContextMenuData) => {
    avatar.value = payload
    petRespects.value = PetRespects.left
    menuView.value = 'main'
    collapsed.value = false
    visible.value = true
    ignoreOutsideUntil = Date.now() + 100
    nextTick(placeMenu)
})

function close() {
    visible.value = false
    menuView.value = 'main'
}

function toggleCollapsed() {
    collapsed.value = !collapsed.value
    nextTick(placeMenu)
}

function setMenuView(view: 'main' | 'dance' | 'actions' | 'signs' | 'moderate' | 'ban') {
    menuView.value = view
    nextTick(placeMenu)
}

function onWindowPointerDown(event: PointerEvent) {
    if (!visible.value || Date.now() < ignoreOutsideUntil) return
    if (menu.value?.contains(event.target as Node)) return
    close()
}

function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') close()
}

function runAction(action: 'dance' | 'sit' | 'wave' | 'laugh' | 'blow' | 'sleep' | 'sign', danceStyle = 1, signValue = 1) {
    const entity = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository.get(avatar.value.id)
    if (!entity?.visualization) return close()

    const visualization = entity.visualization as HumanVisualization
    const actionId = action === 'sit'
        ? (avatar.value.sitting ? ActionId.STAND : ActionId.SIT)
        : ({
            dance: ActionId.DANCE,
            wave: ActionId.WAVE,
            laugh: ActionId.LAUGH,
            blow: ActionId.BLOW,
            sleep: ActionId.SLEEP,
            sign: ActionId.SIGN,
        } as const)[action]

    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
        OutgoingPacket.UserActionEvent,
        {action: actionId, danceStyle, signValue}
    )
    visualization.actions.clear()
    if (action === 'sit') {
        visualization.addAction(actionId)
    } else if (action === 'dance') {
        visualization.danceStyle = danceStyle
        visualization.addAction(actionId)
    } else if (action === 'sign') {
        visualization.signValue = signValue
        visualization.addAction(actionId)
    } else {
        visualization.addAction(actionId)
    }

    visualization.needsUpdate = true
    visualization.draw()
    close()
}

/** The owner of the room sends the user out (the server checks it again). */
function kick() {
    if (avatar.value.userId == null) return close()

    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomKickUserEvent, {
        userId: avatar.value.userId,
    })
    close()
}

function ban(length: 'hour' | 'day' | 'permanent') {
    if (avatar.value.userId == null) return close()

    Engine.getInstance()?.networkingManager?.packetManager?.applyOut(OutgoingPacket.RoomBanUserEvent, {
        userId: avatar.value.userId,
        length,
    })
    close()
}

function changeLook() {
    Engine.getInstance()?.userInterfaceManager?.componentsManager
        .getComponent<IComponentShowableUI>(UIComponent.ChangeLookUI)?.show()
    close()
}

function onResize() {
    if (visible.value) nextTick(placeMenu)
}

onMounted(() => {
    window.addEventListener('pointerdown', onWindowPointerDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onWindowPointerDown)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('resize', onResize)
})
</script>

<style lang="scss">
.avatar-context-menu {
    position: fixed;
    z-index: 100000;
    width: 116px;
    box-sizing: border-box;
    padding: 3px 3px 0;
    overflow: visible;
    color: #fff;
    background: #3a3a3a;
    border: 1px solid #000;
    border-radius: 6px;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .12), 0 2px 3px rgba(0, 0, 0, .35);
    pointer-events: auto;
    font-family: Ubuntu, Arial, sans-serif;
    font-weight: 700;
    user-select: none;

    .avatar-menu-title {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 20px;
        padding: 0 4px;
        overflow: hidden;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .avatar-menu-row {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 22px;
        margin-top: 2px;
        padding: 0 16px;
        box-sizing: border-box;
        background: #555;
        border: 0;
        border-radius: 2px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, .08);
        color: inherit;
        font-family: inherit;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        white-space: nowrap;
        cursor: pointer;
        outline: none;

        &:hover {
            background: #676767;
        }

        &.unavailable {
            color: #9a9a9a;
            cursor: default;

            &:hover {
                background: #555;
            }
        }
    }

    .menu-link {
        text-decoration: underline;
    }

    // the white chevron of a submenu
    .menu-row-arrow::after {
        content: "";
        position: absolute;
        right: 8px;
        top: 50%;
        width: 5px;
        height: 5px;
        border-top: 2px solid #fff;
        border-right: 2px solid #fff;
        transform: translateY(-50%) rotate(45deg);
    }

    .menu-back {
        background: #474747;
        color: #ddd;

        &::before {
            content: "";
            position: absolute;
            left: 8px;
            top: 50%;
            width: 5px;
            height: 5px;
            border-top: 2px solid #ddd;
            border-left: 2px solid #ddd;
            transform: translateY(-50%) rotate(-45deg);
        }
    }

    .avatar-menu-signs {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 2px;
        margin-top: 2px;
    }

    .sign-card {
        height: 20px;
        padding: 0;
        color: #26211b;
        background: #f2d96b;
        border: 1px solid #b8912b;
        border-radius: 2px;
        font-family: inherit;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
        outline: none;

        &:hover {
            background: #ffe98a;
        }
    }

    // the white triangle at the bottom: shrinks / opens the menu
    .avatar-menu-toggle {
        display: block;
        width: 100%;
        height: 14px;
        padding: 0;
        background: transparent;
        border: 0;
        cursor: pointer;
        outline: none;

        &::after {
            content: "";
            display: block;
            margin: 0 auto;
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #fff;
        }

        &.collapsed::after {
            border-top: 0;
            border-bottom: 6px solid #fff;
        }

        &:hover::after {
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, .6));
        }
    }

    // the tail towards the avatar
    .avatar-menu-arrow {
        position: absolute;
        left: calc(var(--avatar-menu-arrow-left) - 6px);
        bottom: -7px;
        width: 10px;
        height: 10px;
        background: #3a3a3a;
        border-right: 1px solid #000;
        border-bottom: 1px solid #000;
        transform: rotate(45deg);
        z-index: -1;
    }

    &.opens-below .avatar-menu-arrow {
        top: -7px;
        bottom: auto;
        transform: rotate(225deg);
    }
}
</style>
